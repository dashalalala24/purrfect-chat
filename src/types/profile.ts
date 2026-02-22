export type TProfile = {
  id: number;
  display_name: string | null;
  first_name: string;
  second_name: string;
  login: string;
  email: string;
  phone: string;
  avatar: string | null;
};

export type TProfilePageContext = {
  profile: TProfile;
  isEditMode: boolean;
};
