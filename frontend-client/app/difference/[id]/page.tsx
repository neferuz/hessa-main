import DifferenceDetailsClient from "./DifferenceDetailsClient";

// Required for static export
export async function generateStaticParams() {
    try {
        const res = await fetch('http://127.0.0.1:8000/api/content');
        const data = await res.json();
        return data.difference.map((item: any) => ({
            id: item.id.toString(),
        }));
    } catch (e) {
        console.error("Failed to fetch static params", e);
        return [];
    }
}

export default function DifferenceDetailsPage() {
    return <DifferenceDetailsClient />;
}
