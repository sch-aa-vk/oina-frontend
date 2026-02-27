#!/usr/bin/env node
import * as cdk from "aws-cdk-lib";
import "dotenv/config";
import { EnvironmentVariables, getEnvVar } from "../lib/helpers/get-env-var";
import { generateResourceId } from "../lib/helpers/generate-resource-id";
import { Stack } from "../lib/cdk-stack";

const app = new cdk.App();
new Stack(app, generateResourceId("stack"), {
  env: {
    account: getEnvVar(EnvironmentVariables.CDK_DEFAULT_ACCOUNT),
    region: getEnvVar(EnvironmentVariables.CDK_DEFAULT_REGION),
  },
});
