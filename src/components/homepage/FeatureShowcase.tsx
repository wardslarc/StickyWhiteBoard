import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { StickyNote, Pencil, Users } from "lucide-react";

interface FeatureProps {
  icon: React.ReactNode;
  title: string;
  description: string;
}

const Feature = ({ icon, title, description = "" }: FeatureProps) => {
  return (
    <Card className="bg-white h-full transition-all duration-300 hover:shadow-lg">
      <CardContent className="flex flex-col items-center text-center p-6">
        <div className="rounded-full bg-primary/10 p-4 mb-4">{icon}</div>
        <h3 className="text-xl font-semibold mb-2">{title}</h3>
        <p className="text-muted-foreground">{description}</p>
      </CardContent>
    </Card>
  );
};

const FeatureShowcase = () => {
  const features = [
    {
      icon: <StickyNote className="h-8 w-8 text-primary" />,
      title: "Sticky Notes",
      description:
        "Create, move, and customize colorful sticky notes to organize your thoughts and ideas.",
    },
    {
      icon: <Pencil className="h-8 w-8 text-primary" />,
      title: "Drawing Tools",
      description:
        "Express your creativity with intuitive drawing tools that let you sketch, highlight, and annotate.",
    },
    {
      icon: <Users className="h-8 w-8 text-primary" />,
      title: "Real-time Collaboration",
      description:
        "Work together with your team in real-time, seeing changes instantly as they happen.",
    },
  ];

  return (
    <section className="py-16 px-4 bg-slate-50">
      <div className="container mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">Powerful Features</h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Everything you need for effective visual collaboration in one simple
            tool
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <Feature
              key={index}
              icon={feature.icon}
              title={feature.title}
              description={feature.description}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeatureShowcase;
