import React from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import PersonalInfoSection from "./PersonalInfoSection";
import SecuritySection from "./SecuritySection";
import { Lock, User } from "lucide-react";

const ProfileSettingsTabs: React.FC = () => {
  return (
    <Card className="w-full max-w-5xl mx-auto bg-white shadow-md rounded-xl overflow-hidden">
      <Tabs defaultValue="personal" className="w-full">
        <TabsList className="w-full grid grid-cols-2 bg-gray-100">
          <TabsTrigger value="personal" className="flex items-center gap-2 data-[state=active]:bg-white data-[state=active]:text-blue-600">
            <User size={18} />
            <span className="hidden sm:inline">Personal Info</span>
          </TabsTrigger>
          <TabsTrigger value="security" className="flex items-center gap-2 data-[state=active]:bg-white data-[state=active]:text-blue-600">
            <Lock size={18} />
            <span className="hidden sm:inline">Security</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="personal" className="p-0">
          <PersonalInfoSection />
        </TabsContent>
        <TabsContent value="security" className="p-0">
          <SecuritySection />
        </TabsContent>
      </Tabs>
    </Card>
  );
};

export default ProfileSettingsTabs;
// This component provides a tabbed interface for user profile settings, allowing users to switch between personal information and security settings.