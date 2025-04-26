import {
  aws_ecs,
  Stack
} from "aws-cdk-lib";

type Deps = {
  stack: Stack
}

const clusterArn = "arn:aws:ecs:eu-west-1:906667703291:cluster/tg-bot-hive"

const configureEcs = ({
  stack
}: Deps) => {

  const cluster = aws_ecs.Cluster.fromClusterArn(stack, "cluster", clusterArn)

  const taskDef = new aws_ecs.TaskDefinition(stack, "my-def", {
    cpu: "256",
    compatibility: aws_ecs.Compatibility.FARGATE,
    memoryMiB: "1024" 
  })

}