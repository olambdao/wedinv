export type InvitationVariant = "groom" | "bride" | "nomap";

export const parseInvitationVariant = (
  value: string | string[] | undefined
): InvitationVariant => {
  const variant = Array.isArray(value) ? value[0] : value;
  return variant === "bride" || variant === "nomap" ? variant : "groom";
};
