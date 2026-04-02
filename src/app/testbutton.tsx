import { Button } from "@/components/ui/button";

export default function HomeButton() {
    return (
        <div className="p-4">
            <Button variant={"default"}>Click Me!</Button>
            <Button variant={"ghost"} className="ml-2">Outline Button</Button>
        </div>
    );
}
