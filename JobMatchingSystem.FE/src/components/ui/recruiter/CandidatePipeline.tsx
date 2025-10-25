import { Progress } from "@/components/ui/progress";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const pipelineData = [
  {
    stage: "Applied",
    count: 1847,
    percentage: 100,
    color: "bg-blue-500",
  },
  {
    stage: "Screening",
    count: 324,
    percentage: 18,
    color: "bg-green-500",
  },
  {
    stage: "Interview",
    count: 89,
    percentage: 5,
    color: "bg-yellow-500",
  },
  {
    stage: "Final Round",
    count: 23,
    percentage: 1.2,
    color: "bg-orange-500",
  },
  {
    stage: "Offer",
    count: 8,
    percentage: 0.4,
    color: "bg-purple-500",
  },
];

export function CandidatePipeline() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Candidate Pipeline</CardTitle>
        <CardDescription>
          Current status of candidates in the recruitment process
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {pipelineData.map((stage) => (
            <div key={stage.stage} className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <div className={`w-3 h-3 rounded-full ${stage.color}`} />
                  <span className="font-medium">{stage.stage}</span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <span>{stage.count} candidates</span>
                  <span>({stage.percentage}%)</span>
                </div>
              </div>
              <Progress value={stage.percentage} className="h-2" />
            </div>
          ))}
        </div>
        
        <div className="mt-6 pt-6 border-t">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-muted-foreground">Conversion Rate</span>
              <div className="text-lg font-semibold">4.3%</div>
            </div>
            <div>
              <span className="text-muted-foreground">Avg. Time to Hire</span>
              <div className="text-lg font-semibold">21 days</div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}