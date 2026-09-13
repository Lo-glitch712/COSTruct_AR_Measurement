export type ProfileDetails = {
  firstName: string
  middleName: string
  lastName: string
  birthday: string
  street: string
  city: string
  province: string
  zipCode: string
  phone: string
  email: string
}

export const EMPTY_PROFILE: ProfileDetails = {
  firstName: "",
  middleName: "",
  lastName: "",
  birthday: "",
  street: "",
  city: "",
  province: "",
  zipCode: "",
  phone: "",
  email: "",
}

export function fullName(
  profile: Pick<ProfileDetails, "firstName" | "middleName" | "lastName">,
) {
  return [profile.firstName, profile.middleName, profile.lastName]
    .map((part) => part.trim())
    .filter(Boolean)
    .join(" ")
}

export function formatAddress(
  profile: Pick<ProfileDetails, "street" | "city" | "province" | "zipCode">,
) {
  return [profile.street, profile.city, profile.province, profile.zipCode]
    .map((part) => part.trim())
    .filter(Boolean)
    .join(", ")
}

export function profileFromUnknown(value: Partial<ProfileDetails> | null | undefined) {
  return {
    firstName: value?.firstName ?? "",
    middleName: value?.middleName ?? "",
    lastName: value?.lastName ?? "",
    birthday: value?.birthday ?? "",
    street: value?.street ?? "",
    city: value?.city ?? "",
    province: value?.province ?? "",
    zipCode: value?.zipCode ?? "",
    phone: value?.phone ?? "",
    email: value?.email ?? "",
  }
}
