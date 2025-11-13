import { Metadata } from "next";

const metaData: Metadata ={
    title: 'Edit Admin Users | Chatbot Admin',
    description: "Admin panel for chatbots",
}

export default function Layout({
    children
}:Readonly<{children:React.ReactNode}>){
    return(
        <section>
            {children}
        </section>
    )
}