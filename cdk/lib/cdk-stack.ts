import * as cdk from "aws-cdk-lib";
import * as path from "path";
import { BlockPublicAccess, Bucket } from "aws-cdk-lib/aws-s3";
import { EnvironmentVariables, getEnvVar } from "./helpers/get-env-var";
import { generateResourceId } from "./helpers/generate-resource-id";
import { BucketDeployment, Source } from "aws-cdk-lib/aws-s3-deployment";
import { Certificate } from "aws-cdk-lib/aws-certificatemanager";
import {
  AllowedMethods,
  Distribution,
  OriginProtocolPolicy,
} from "aws-cdk-lib/aws-cloudfront";
import { HttpOrigin } from "aws-cdk-lib/aws-cloudfront-origins";
import { Construct } from "constructs";
import { ARecord, HostedZone, RecordTarget } from "aws-cdk-lib/aws-route53";
import { CloudFrontTarget } from "aws-cdk-lib/aws-route53-targets";

export class Stack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const domainName = getEnvVar(EnvironmentVariables.DOMAIN_NAME);

    const certificate = Certificate.fromCertificateArn(
      this,
      generateResourceId("certificate"),
      getEnvVar(EnvironmentVariables.CERTIFICATE_ARN)
    );

    const bucket = new Bucket(this, generateResourceId("bucket"), {
      bucketName: generateResourceId("bucket-name"),
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      autoDeleteObjects: true,
      publicReadAccess: true,
      blockPublicAccess: new BlockPublicAccess({
        blockPublicAcls: false,
        blockPublicPolicy: false,
        ignorePublicAcls: false,
        restrictPublicBuckets: false,
      }),
      versioned: true,
      websiteIndexDocument: "index.html",
    });

    const cdn = new Distribution(this, generateResourceId("cdn"), {
      domainNames: [domainName],
      defaultBehavior: {
        origin: new HttpOrigin(bucket.bucketWebsiteDomainName, {
          protocolPolicy: OriginProtocolPolicy.HTTP_ONLY,
          httpPort: 80,
          httpsPort: 443,
        }),
        allowedMethods: AllowedMethods.ALLOW_GET_HEAD_OPTIONS,
        compress: true,
      },
      certificate: certificate,
      errorResponses: [
        {
          httpStatus: 404,
          responseHttpStatus: 200,
          responsePagePath: "/index.html",
          ttl: cdk.Duration.seconds(0),
        },
      ],
    });

    new BucketDeployment(this, generateResourceId("bucket-deploy"), {
      sources: [Source.asset(path.join(__dirname, "../../out"))],
      destinationBucket: bucket,
      distribution: cdn,
      distributionPaths: ["/*"],
    });

    new cdk.CfnOutput(this, generateResourceId("domain-name"), {
      value: domainName,
      exportName: generateResourceId("domain-name-output"),
    });

    const zone = HostedZone.fromHostedZoneAttributes(
      this,
      generateResourceId("hosted-zone"),
      {
        hostedZoneId: getEnvVar(EnvironmentVariables.HOSTED_ZONE_ID),
        zoneName: getEnvVar(EnvironmentVariables.DOMAIN_NAME),
      }
    );

    new ARecord(this, generateResourceId("route-record"), {
      zone,
      target: RecordTarget.fromAlias(new CloudFrontTarget(cdn)),
    });
  }
}
