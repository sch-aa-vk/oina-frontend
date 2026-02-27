import { EnvironmentVariables, getEnvVar } from "./get-env-var";

export const generateResourceId = (id: string) => {
  const stageName = getEnvVar(EnvironmentVariables.STAGE_NAME);

  return `oina-frontend-${id}-${stageName}`;
};
