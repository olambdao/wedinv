export type InvitationSide = "groom" | "bride";
export type InvitationVariant = InvitationSide | "nomap";

export const parseInvitationVariant = (
  value: string | string[] | undefined
): InvitationVariant => {
  const variant = Array.isArray(value) ? value[0] : value;
  return variant === "bride" || variant === "nomap" ? variant : "groom";
};

export const parseInvitationSide = (
  value: string | string[] | undefined
): InvitationSide => {
  const side = Array.isArray(value) ? value[0] : value;
  return side === "groom" ? "groom" : "bride";
};

export const parseInvitationSideOverride = (
  value: string | string[] | undefined
): InvitationSide | undefined => {
  const side = Array.isArray(value) ? value[0] : value;
  return side === "groom" || side === "bride" ? side : undefined;
};

export const getOrderedInvitationSides = (
  primarySide: InvitationSide
): InvitationSide[] =>
  primarySide === "groom" ? ["groom", "bride"] : ["bride", "groom"];
