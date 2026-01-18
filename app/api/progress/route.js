import { PrismaClient } from "@prisma/client";
import { NextResponse } from "next/server";

const prisma = new PrismaClient();

export async function GET(req) {
    try {
        const logs = await prisma.progressLog.findMany({
            orderBy: { date: 'desc' }
        });
        return NextResponse.json(logs);
    } catch (error) {
        console.error("Error fetching logs:", error);
        return NextResponse.json({ error: "Failed to fetch logs" }, { status: 500 });
    }
}

export async function POST(req) {
    try {
        const body = await req.json();
        const { subject, topic, score, mistakes, fix_strategy, next_drill } = body;

        const log = await prisma.progressLog.create({
            data: {
                subject,
                topic,
                score,
                mistakes,
                fixStrategy: fix_strategy,
                nextDrill: next_drill,
            },
        });

        return NextResponse.json(log);
    } catch (error) {
        console.error("Error creating log:", error);
        return NextResponse.json({ error: "Failed to create log" }, { status: 500 });
    }
}
