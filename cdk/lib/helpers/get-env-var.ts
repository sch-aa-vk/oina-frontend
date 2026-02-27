import "dotenv/config";

export enum EnvironmentVariables {
  DOMAIN_NAME = "DOMAIN_NAME",
  CERTIFICATE_ARN = "CERTIFICATE_ARN",
  HOSTED_ZONE_ID = "HOSTED_ZONE_ID",
  STAGE_NAME = "STAGE_NAME",
  CDK_DEFAULT_ACCOUNT = "CDK_DEFAULT_ACCOUNT",
  CDK_DEFAULT_REGION = "CDK_DEFAULT_REGION",
}

export const getEnvVar = (name: EnvironmentVariables): string => {
  const value = process.env[String(name)];

  if (!value) {
    throw new Error(`Environment variable ${name} is not defined`);
  }

  return value;
};
