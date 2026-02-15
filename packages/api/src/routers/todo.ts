import { db } from "@hotel-management/db";
import { todos } from "@hotel-management/db/schema/todo";
import { eq } from "drizzle-orm";
import z from "zod";

import { publicProcedure, router } from "../index";

export const todoRouter = router({
  getAll: publicProcedure.query(async () => {
    return await db.select().from(todos);
  }),

  create: publicProcedure
    .input(z.object({ text: z.string().min(1) }))
    .mutation(async ({ input }) => {
      return await db.insert(todos).values({
        text: input.text,
      });
    }),

  toggle: publicProcedure
    .input(z.object({ id: z.number(), completed: z.boolean() }))
    .mutation(async ({ input }) => {
      return await db
        .update(todos)
        .set({ completed: input.completed })
        .where(eq(todos.id, input.id));
    }),

  delete: publicProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      return await db.delete(todos).where(eq(todos.id, input.id));
    }),
});
