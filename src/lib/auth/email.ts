type LoggedAuthEmail = {
  action: "invitation" | "password-reset";
  recipient: string;
  url: string;
  subject: string;
};

export async function logAuthEmail(input: LoggedAuthEmail) {
  console.info(
    `[auth-email:${input.action}] ${input.recipient} ${input.subject} ${input.url}`,
  );
}
