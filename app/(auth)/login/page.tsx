"use client"
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { IconBrandGithub } from "@tabler/icons-react";


export default function LoginPage(){

    const handleSignIn = () => {
    // Use environment variable for the API URL to support different environments.
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";
    window.location.href = `${apiUrl}/auth/github`;
  };

    return (
        <Card>
            <CardHeader>
                <CardTitle className="text-xl">Login</CardTitle>
                <CardDescription>Login with your Github Account</CardDescription>
            </CardHeader>

            <CardContent>
                <Button className="w-full" variant="outline" onClick = {handleSignIn}>
                    <IconBrandGithub className="size-4" /> Sign in with Github
                </Button>
            </CardContent>
        </Card>
    )
}