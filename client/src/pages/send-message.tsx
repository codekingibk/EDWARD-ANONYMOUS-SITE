import { Redirect } from "wouter";

export default function SendMessage() {
  // This route is handled by user-profile.tsx with the /u/:username pattern
  return <Redirect to="/" />;
}
