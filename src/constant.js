//? User Roles this for temporary
//TODO: make it dynamic admin can control roles add more roles for initial we have these two roles
export const UserRoleEnum = {
  ADMIN: "ADMIN",
  USER: "USER",
};

export const ThemeEnum = {
  Default: "default",
  AquaSunset: "aquaSunset",
  BlushBloom: "blushBloom",
  EarthMoss: "earthMoss",
  CrimsonSand: "crimsonSand",
  VioletDream: "violetDream",
};

export const AvailableUserRoles = Object.values(UserRoleEnum);

//? This will be used for user token expiry time
export const USER_TEMP_TOKEN_EXPIRY = 20 * 60 * 1000;
