'use client'
import { Avatar, Button, Chip, Grid, Modal, Paper, Popper, Tooltip, Typography } from "@mui/material";
import CloseIcon from '@mui/icons-material/Close';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import page from '@/components/popperComponent/page.module.css';
import { useState } from "react";
import { useRouter } from "next/navigation";
import { cTheme } from "@/theme/colorScheme";



export default function ScriptComponent(props: any) {

    const [contentCopied, setContentCopied] = useState(false);
    const { push } = useRouter();
    const scriptText = `
    <script src="` + process.env.NEXT_PUBLIC_API + `/main.bundle.js"></script>
    <script>
        var chatConfig = {
            CHAT_PLACEHOLDER: "Enter a message...",
            API_KEY: "` + props.chatbotId + `",
        };
        window.initBot(window, document, chatConfig);
    </script>`


    function handleCopyTheScript() {
        try {
            navigator.clipboard.writeText(scriptText);
            setContentCopied(true);
            setTimeout(() => {
                setContentCopied(false);
            }, 2000);
        } catch (error) {
            console.error('Error copying content: ', error);
        }
    }

    return (
        <>
            <Modal
                open={props.open}
                onClose={props.handleClose}
                aria-labelledby="modal-modal-title"
                aria-describedby="modal-modal-description"
            >
                <Paper elevation={2}
                    className={`${page["popper-container"]}`}
                    sx={{
                        p: 2,
                        position: 'absolute' as 'absolute',
                        top: '50%',
                        left: '50%',
                        transform: 'translate(-50%, -50%)',
                        border: 0,
                        boxShadow: 24,
                    }}>
                    <Grid container item xs={12} direction={'row'}  >
                        <Grid container item xs={12} md={11} justifyContent={'space-between'} alignItems={'center'} >
                            <Typography sx={{ fontWeight: '600', color: cTheme.primaryFontColor, fontSize: "14px" }}>Script</Typography>
                        </Grid>
                        <Grid container item xs={12} md={1} justifyContent={'flex-end'} alignItems={'center'} >
                            <CloseIcon fontSize='small' onClick={props.page === 'createChatbot' ? () => { props.handleClose(); push('/chatbots'); } : props.handleClose}
                                sx={{ cursor: 'pointer' }} />
                        </Grid>
                    </Grid>
                    <Grid container sx={{ borderBottom: "3px solid #F6F5FB", mt: "2vh" }}  > </Grid>
                    <Grid container item xs={12} sx={{ mt: "2vh" }}>
                        <Grid container item xs={12} justifyContent={'center'} alignItems={'center'}>
                            <Typography sx={{ fontWeight: '600', color: 'black', fontSize: "12px" }}>
                                <blockquote>
                                    <pre>
                                        <code>
                                            {`// Add the below script into your body tag of your HTML file`}
                                            {scriptText}
                                        </code>
                                    </pre>
                                </blockquote>
                            </Typography>
                        </Grid>
                    </Grid>
                    <Grid container item xs={12} sx={{ mt: "2vh" }} justifyContent={'flex-end'} alignItems={'center'} >
                        <Grid container item xs={10} justifyContent={'center'} alignItems={'center'} >
                            {(props.page == 'createChatbot') && <Button variant="contained"
                                sx={{ ml: "5vh", backgroundColor: cTheme.primaryFontColor, '&:hover': { backgroundColor: cTheme.primaryFontColor } }}
                                onClick={() => push('/chatbots')}>OK</Button>}
                        </Grid>
                        <Grid container item xs={2} justifyContent={'center'} alignItems={'center'}>
                            <Grid item xs={1} justifyContent={'center'} alignItems={'center'} >
                                <Tooltip title={contentCopied ? "Copied" : "Copy"} placement="top-start" arrow>
                                    <Avatar onClick={handleCopyTheScript} sx={{ cursor: 'pointer' }}>
                                        <ContentCopyIcon />
                                    </Avatar>
                                </Tooltip>
                            </Grid>
                        </Grid>
                    </Grid>
                </Paper>
            </Modal>
        </>
    )
}