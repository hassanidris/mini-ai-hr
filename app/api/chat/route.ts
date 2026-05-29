import { getUser } from "@/lib/supabase/server";
import { prisma } from "@/db/prisma";
import { GoogleGenAI, Type } from "@google/genai";
import type { FunctionCall, Tool } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });

const HR_TOOLS: Tool[] = [
  {
    functionDeclarations: [
      {
        name: "list_employees",
        description:
          "List all employees. Optionally filter by status (ACTIVE or INACTIVE) or search by name, department, or job title.",
        parameters: {
          type: Type.OBJECT,
          properties: {
            search: {
              type: Type.STRING,
              description: "Search term for name, department, or job title",
            },
            status: {
              type: Type.STRING,
              format: "enum",
              enum: ["ACTIVE", "INACTIVE"],
              description: "Filter by employment status",
            },
          },
        },
      },
      {
        name: "find_employee_by_name",
        description:
          "Find an employee by their name (partial match). Use this before update or deactivate to get the employee ID.",
        parameters: {
          type: Type.OBJECT,
          properties: {
            name: {
              type: Type.STRING,
              description: "Employee's name or partial name",
            },
          },
          required: ["name"],
        },
      },
      {
        name: "create_employee",
        description: "Create a new employee record in the HR system.",
        parameters: {
          type: Type.OBJECT,
          properties: {
            name: { type: Type.STRING },
            email: { type: Type.STRING },
            jobTitle: { type: Type.STRING },
            department: { type: Type.STRING },
            employmentType: {
              type: Type.STRING,
              format: "enum",
              enum: ["FULL_TIME", "PART_TIME", "CONTRACT", "INTERN"],
            },
            joiningDate: {
              type: Type.STRING,
              description: "ISO date string in YYYY-MM-DD format",
            },
          },
          required: [
            "name",
            "email",
            "jobTitle",
            "department",
            "employmentType",
            "joiningDate",
          ],
        },
      },
      {
        name: "update_employee",
        description:
          "Update one or more fields on an existing employee. Provide the employee ID plus any fields to change.",
        parameters: {
          type: Type.OBJECT,
          properties: {
            id: { type: Type.STRING, description: "Employee ID" },
            name: { type: Type.STRING },
            email: { type: Type.STRING },
            jobTitle: { type: Type.STRING },
            department: { type: Type.STRING },
            employmentType: {
              type: Type.STRING,
              format: "enum",
              enum: ["FULL_TIME", "PART_TIME", "CONTRACT", "INTERN"],
            },
            joiningDate: { type: Type.STRING },
          },
          required: ["id"],
        },
      },
      {
        name: "deactivate_employee",
        description:
          "Deactivate an employee by setting their status to INACTIVE.",
        parameters: {
          type: Type.OBJECT,
          properties: {
            id: { type: Type.STRING, description: "Employee ID" },
          },
          required: ["id"],
        },
      },
    ],
  },
];

function buildSystemPrompt(): string {
  return `You are a helpful AI HR assistant for a company's HR management system.
You help HR admins manage employee records conversationally.
When asked to perform an action (create, update, deactivate), use the available tools.
If you need to update or deactivate an employee by name, first call find_employee_by_name to get their ID, then perform the action.
Always confirm completed actions clearly and concisely.
Today's date is ${new Date().toISOString().split("T")[0]}.`;
}

export async function POST(request: Request) {
  try {
    const user = await getUser();
    if (!user) {
      return Response.json({ errorMessage: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { message } = body as { message?: string };

    if (!message?.trim()) {
      return Response.json(
        { errorMessage: "Message is required" },
        { status: 400 },
      );
    }

    // Ensure a local User row exists for this Supabase auth user
    const dbUser = await prisma.user.upsert({
      where: { email: user.email! },
      update: {},
      create: { email: user.email! },
    });

    // Load the last 20 messages so Gemini has conversation context
    const history = await prisma.chatMessage.findMany({
      where: { userId: dbUser.id },
      orderBy: { createdAt: "desc" },
      take: 20,
    });

    // Convert DB messages to the format Gemini expects for history
    const geminiHistory = history.reverse().map((msg) => ({
      role: msg.role === "user" ? ("user" as const) : ("model" as const),
      parts: [{ text: msg.content }],
    }));

    const chat = ai.chats.create({
      model: "gemini-2.0-flash-lite",
      history: geminiHistory,
      config: {
        tools: HR_TOOLS,
        systemInstruction: buildSystemPrompt(),
      },
    });

    // Send the user's message — Gemini may respond with text OR a function call
    let result = await chat.sendMessage({ message: message.trim() });
    let actionLabel: string | undefined;

    // Agentic loop: keep executing tool calls until Gemini returns a text reply
    // The safety counter prevents infinite loops
    let safetyCounter = 0;
    while (result.functionCalls?.length && safetyCounter < 5) {
      safetyCounter++;
      const calls = result.functionCalls!;

      // Run every requested tool call and collect the results
      const functionResponseParts = await Promise.all(
        calls.map(async (call: FunctionCall) => {
          const output = await executeTool(
            call.name!,
            call.args as Record<string, unknown>,
          );

          // Track which mutating action was performed (for UI badge display)
          const readOnlyTools = ["list_employees", "find_employee_by_name"];
          if (!readOnlyTools.includes(call.name!)) {
            actionLabel = call.name;
          }

          return {
            functionResponse: {
              id: call.id,
              name: call.name!,
              response: output as Record<string, unknown>,
            },
          };
        }),
      );

      // Send the tool results back so Gemini can form its final answer
      result = await chat.sendMessage({ message: functionResponseParts });
    }

    const reply =
      result.text ||
      "Sorry, I couldn't complete that request — please try again or rephrase.";

    // Persist both sides of the exchange
    await prisma.chatMessage.createMany({
      data: [
        { userId: dbUser.id, role: "user", content: message.trim() },
        {
          userId: dbUser.id,
          role: "assistant",
          content: reply,
          action: actionLabel ?? null,
        },
      ],
    });

    return Response.json({ reply, action: actionLabel });
  } catch (error: unknown) {
    console.error("[POST /api/chat]", error);
    if (
      typeof error === "object" &&
      error !== null &&
      "status" in error &&
      (error as { status: number }).status === 429
    ) {
      return Response.json(
        {
          errorMessage:
            "The AI service is rate-limited (free tier quota exceeded). Please wait a moment and try again, or check your Gemini API key at https://aistudio.google.com/apikey.",
        },
        { status: 429 },
      );
    }
    return Response.json(
      { errorMessage: "Something went wrong. Please try again." },
      { status: 500 },
    );
  }
}

// ── Tool executor ─────────────────────────────────────────────────────────────

async function executeTool(
  name: string,
  args: Record<string, unknown>,
): Promise<Record<string, unknown>> {
  try {
    switch (name) {
      case "list_employees": {
        const { search, status } = args as {
          search?: string;
          status?: string;
        };
        const employees = await prisma.employee.findMany({
          where: {
            ...(status && { status: status as "ACTIVE" | "INACTIVE" }),
            ...(search && {
              OR: [
                { name: { contains: search, mode: "insensitive" } },
                { department: { contains: search, mode: "insensitive" } },
                { jobTitle: { contains: search, mode: "insensitive" } },
              ],
            }),
          },
          orderBy: { name: "asc" },
          select: {
            id: true,
            name: true,
            email: true,
            jobTitle: true,
            department: true,
            status: true,
            employmentType: true,
          },
        });
        return { employees };
      }

      case "find_employee_by_name": {
        const { name: searchName } = args as { name: string };
        const employees = await prisma.employee.findMany({
          where: { name: { contains: searchName, mode: "insensitive" } },
          select: {
            id: true,
            name: true,
            email: true,
            jobTitle: true,
            department: true,
            status: true,
          },
        });
        return { employees };
      }

      case "create_employee": {
        const data = args as {
          name: string;
          email: string;
          jobTitle: string;
          department: string;
          employmentType: string;
          joiningDate: string;
        };
        const parsedJoiningDate = new Date(data.joiningDate);
        if (isNaN(parsedJoiningDate.getTime())) {
          return {
            error: `Invalid joiningDate: "${data.joiningDate}". Use YYYY-MM-DD format.`,
          };
        }
        const employee = await prisma.employee.create({
          data: {
            name: data.name.trim(),
            email: data.email.trim().toLowerCase(),
            jobTitle: data.jobTitle.trim(),
            department: data.department.trim(),
            employmentType: data.employmentType as
              | "FULL_TIME"
              | "PART_TIME"
              | "CONTRACT"
              | "INTERN",
            joiningDate: parsedJoiningDate,
          },
        });
        return {
          success: true,
          employee: { id: employee.id, name: employee.name },
        };
      }

      case "update_employee": {
        const { id, ...fields } = args as {
          id: string;
          name?: string;
          email?: string;
          jobTitle?: string;
          department?: string;
          employmentType?: string;
          joiningDate?: string;
        };
        const updateData: Record<string, unknown> = {};
        if (fields.name) updateData.name = fields.name.trim();
        if (fields.email) updateData.email = fields.email.trim().toLowerCase();
        if (fields.jobTitle) updateData.jobTitle = fields.jobTitle.trim();
        if (fields.department) updateData.department = fields.department.trim();
        if (fields.employmentType)
          updateData.employmentType = fields.employmentType;
        if (fields.joiningDate)
          updateData.joiningDate = new Date(fields.joiningDate);

        const employee = await prisma.employee.update({
          where: { id },
          data: updateData,
        });
        return {
          success: true,
          employee: { id: employee.id, name: employee.name },
        };
      }

      case "deactivate_employee": {
        const { id } = args as { id: string };
        const employee = await prisma.employee.update({
          where: { id },
          data: { status: "INACTIVE" },
        });
        return {
          success: true,
          employee: { id: employee.id, name: employee.name },
        };
      }

      default:
        return { error: `Unknown function: ${name}` };
    }
  } catch (error) {
    console.error(`[executeTool:${name}]`, error);
    return { error: String(error) };
  }
}
