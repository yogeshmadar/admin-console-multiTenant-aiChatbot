import { Metadata } from "next";

const metadata:Metadata= {
    title : 'Create Chatbot | Chatbot Admin',
    description: "Admin panel for chatbots",
} 

export default function Layout({children} : Readonly<{children:React.ReactNode}>){
    return(
        <section>
            {children}
        </section>
    )
}