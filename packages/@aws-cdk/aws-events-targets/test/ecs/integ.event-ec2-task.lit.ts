import ec2 = require('@aws-cdk/aws-ec2');
import ecs = require('@aws-cdk/aws-ecs');
import events = require('@aws-cdk/aws-events');
import cdk = require('@aws-cdk/cdk');
import targets = require('../../lib');

import path = require('path');

const app = new cdk.App();

class EventStack extends cdk.Stack {
  constructor(scope: cdk.App, id: string) {
    super(scope, id);

    const vpc = new ec2.Vpc(this, 'Vpc', { maxAZs: 1 });

    const cluster = new ecs.Cluster(this, 'EcsCluster', { vpc });
    cluster.addCapacity('DefaultAutoScalingGroup', {
      instanceType: new ec2.InstanceType('t2.micro')
    });

    /// !show
    // Create a Task Definition for the container to start
    const taskDefinition = new ecs.Ec2TaskDefinition(this, 'TaskDef');
    taskDefinition.addContainer('TheContainer', {
      image: ecs.ContainerImage.fromAsset(this, 'EventImage', {
        directory: path.resolve(__dirname, 'eventhandler-image')
      }),
      memoryLimitMiB: 256,
      logging: new ecs.AwsLogDriver(this, 'TaskLogging', { streamPrefix: 'EventDemo' })
    });

    // An Rule that describes the event trigger (in this case a scheduled run)
    const rule = new events.Rule(this, 'Rule', {
      scheduleExpression: 'rate(1 minute)',
    });

    // Use EcsTask as the target of the Rule
    rule.addTarget(new targets.EcsTask({
      cluster,
      taskDefinition,
      taskCount: 1,
      containerOverrides: [{
        containerName: 'TheContainer',
        environment: [
          { name: 'I_WAS_TRIGGERED', value: 'From CloudWatch Events' }
        ]
      }]
    }));
    /// !hide
  }
}

new EventStack(app, 'aws-ecs-integ-ecs');
app.synth();
