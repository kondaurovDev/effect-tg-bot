import { Schema as S } from "@effect/schema";

export type MessageUpdate = S.Schema.Type<typeof MessageUpdate>;
export const MessageUpdate = S.struct({
  message_id: S.number,
  from: S.struct({
    id: S.number,
    first_name: S.string
  }),
  text: S.optional(S.string)
})

export type UpdateObject = S.Schema.Type<typeof UpdateObject>;
export const UpdateObject = S.struct({
  update_id: S.number,
  message: S.optional(MessageUpdate),
});