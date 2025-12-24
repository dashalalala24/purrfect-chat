export type TProfile = {
  id: string;
  displayName: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  avatarSrc: string | null;
};

export type TProfilePageContext = {
  profile: TProfile;
  isEditMode: boolean;
};
