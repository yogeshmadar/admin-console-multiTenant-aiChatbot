'use client'

import { Button, CircularProgress, Grid, MenuItem, Select, TextField, Typography } from "@mui/material";
import { useState } from "react";
import { useRouter } from "next/navigation";
import page from '@/components/sidebar/page.module.css';
import SnakBarAlert from "@/components/snakbarAlert/snackbarAlert";
import React from "react";
import ScriptComponent from "@/components/popperComponent/scriptComponent";
import "react-color-palette/css";
import ColorPickerInput from "@/components/ColorPickerInput/ColorPickerInput";
import { cTheme } from "@/theme/colorScheme";


export default function ChatBox() {

    const [isAllChatbotBtnLoader, setIsAllChatbotBtnLoader] = useState(false);
    const [createChatbotBtnloading, setCreateChatbotBtnLoading] = useState<Boolean>(false);
    const [alert, setAlert] = useState("");
    const [alertOpen, setAlertOpen] = useState(false);
    const [alertSeverity, setAlertSeverity] = useState(false);
    const [open, setOpen] = React.useState(false);
    const [chatbotId, setChatbotId] = React.useState('');
    const [createChatbotData, setCreateChatbotData] = useState({
        Chatbot_Name: '',
        Website_Sitemap_URL: '',
        Whitelist_Domain: '',
        Theme_Color: '#121212',
        Initial_Message: '',
        Helpdesk_Url: '',
        Privacy_Policy: '',
        Initial_Context: ''
    });
    const [errors, setErrors] = useState({
        Chatbot_Name: '',
        Website_Sitemap_URL: '',
        Whitelist_Domain: '',
        Theme_Color: '',
        Initial_Message: '',
        Helpdesk_Url: '',
        Privacy_Policy: '',
        Initial_Context: ''
    });

    const handleOpen = () => setOpen(true);
    const handleClose = () => setOpen(false);
    const { push } = useRouter();

    const handleChange = (e: any) => {
        const { name, value } = e.target;
        let error = '';
        let maxLength = name === 'Website_Sitemap_URL' ? 100 : 500;
        if (value.length <= maxLength) {
            setCreateChatbotData({ ...createChatbotData, [name]: value });
        } else {
            error = `${name} must be ${maxLength} characters or less`;
        }
        setErrors({ ...errors, [name]: error });
    };

    const handleBlur = (e: any) => {
        const { name, value } = e.target;
        let error = '';
        const formattedName = name.replace(/_/g, ' ').replace(/\b\w/g, (char: any) => char.toUpperCase());
        error = value.trim() === '' ? `${formattedName} is required` : '';
        setErrors({ ...errors, [name]: error });
    };

    const onSubmitOfCreateChatbot = async () => {
        const requestBody = {
            bot_name: createChatbotData.Chatbot_Name,
            description: '',
            theme_color: createChatbotData.Theme_Color,
            sitemap_url: createChatbotData.Website_Sitemap_URL,
            privacy_policy: createChatbotData.Privacy_Policy,
            whitelist_domain: createChatbotData.Whitelist_Domain,
            initial_message: createChatbotData.Initial_Message,
            helpdesk_url: createChatbotData.Helpdesk_Url,
            initial_context: createChatbotData.Initial_Context,
            is_active: true
        }
        try {
            setCreateChatbotBtnLoading(true);
            const response = await fetch(`/api/chatbots`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(requestBody),
            });
            const chatbotResponse = await response.json();
            if (response.status == 200) {
                setChatbotId(chatbotResponse?.data?.BotID);
                AlertManager(chatbotResponse?.message, false);
                setCreateChatbotBtnLoading(false);
                handleOpen();
                // push('/chatbots');
            }
            else if(response.status === 500) {
                AlertManager("Sorry, there is a problem with the server. Try again later", true)
            }
            else {
                AlertManager(chatbotResponse?.message, true);
            }
        }
        catch (error: any) {
            AlertManager("Sorry, there is a problem with the server. Try again later", true);
        }
    }


    function AlertManager(message: string, severity: boolean) {
        setAlert(message);
        setAlertSeverity(severity);
        setAlertOpen(true);
        setCreateChatbotBtnLoading(false);
    }

    return (
        <div className={`${page["custom-container"]}`} style={{ backgroundColor: "#F6F5FB", paddingBottom: '5vh', minHeight: '100vh' }}>
            <Grid container item xs={12} justifyContent={'flex-start'} alignItems={'center'} sx={{ pl: 3 }}>
                <Grid container item xs={11.5} alignItems={'flex-start'} justifyContent={'center'} sx={{ backgroundColor: 'white', borderRadius: '2vh', p: 2, mt: "5vh", minHeight: "90vh" }} >
                    <Grid container item xs={12} direction="row" justifyContent={"center"} alignItems={"center"} >
                        <Grid container item xs={12} sm={9} md={9} lg={10} gap={1.5} direction="row" alignItems="center" justifyContent={'space-between'} sx={{ mb: 1 }}>
                            <Grid item xs={12} sm={3.5} md={3.5} lg={2.5} xl={2}  >
                                <Typography variant="body1" sx={{ fontWeight: "700", color: cTheme.primaryFontColor }}> Create Chatbot</Typography>
                            </Grid>
                        </Grid>
                        <Grid container item xs={12} sm={3} md={3} lg={2} justifyContent={"flex-end"} >
                            <Button
                                fullWidth
                                variant="contained"
                                onClick={() => { setIsAllChatbotBtnLoader(true); push('/chatbots') }}
                                sx={{ textTransform: "initial", backgroundColor: cTheme.primaryFontColor, borderRadius: "1vh !important", color: "#F0F2FF", fontWeight: "700", p: "1.2vh", '&:hover': { backgroundColor: cTheme.primaryBackground } }}
                            >
                                {isAllChatbotBtnLoader ?
                                    <CircularProgress sx={{ color: 'white' }} size={20} /> :
                                    <>
                                        <Typography variant="caption" sx={{ fontWeight: "700" }}>ALL CHATBOTS</Typography>
                                    </>
                                }
                            </Button>
                        </Grid>
                        <Grid container sx={{ borderBottom: "3px solid #F6F5FB", mt: "2vh" }}  > </Grid>
                        <Grid container item xs={12} sm={8.5} sx={{ color: "#777", m: "5vh", mt: "8vh", }} justifyContent={'space-between'} alignItems={'flex-start'}>
                            <Grid container item xs={12} justifyContent={"space-between"} alignItems={"center"} >
                                <Grid container item xs={12} sm={3.7}>
                                    <TextField
                                        fullWidth
                                        name="Chatbot_Name"
                                        id="Chatbot Name"
                                        type="text"
                                        placeholder="Chatbot Name"
                                        size="small"
                                        variant="standard"
                                        value={createChatbotData.Chatbot_Name}
                                        error={!!errors.Chatbot_Name}
                                        helperText={errors.Chatbot_Name}
                                        onChange={handleChange}
                                        onBlur={handleBlur}
                                        InputProps={{ sx: { maxLength: 51 } }} />
                                </Grid>
                                <Grid container item xs={12} sm={3.7}>
                                    <TextField
                                        fullWidth
                                        name="Website_Sitemap_URL"
                                        id="Website Sitemap URL"
                                        type="text"
                                        placeholder="Website Sitemap URL"
                                        size="small"
                                        variant="standard"
                                        value={createChatbotData.Website_Sitemap_URL}
                                        error={!!errors.Website_Sitemap_URL}
                                        helperText={errors.Website_Sitemap_URL}
                                        onChange={handleChange}
                                        onBlur={handleBlur}
                                        InputProps={{ sx: { maxLength: 100 } }}
                                    />
                                </Grid>
                                <Grid container item xs={12} sm={3.7}>
                                    <TextField
                                        fullWidth
                                        name="Whitelist_Domain"
                                        id="Whitelist Domain"
                                        type="text"
                                        placeholder="Whitelist Domain"
                                        size="small"
                                        variant="standard"
                                        value={createChatbotData.Whitelist_Domain}
                                        error={!!errors.Whitelist_Domain}
                                        helperText={errors.Whitelist_Domain}
                                        onChange={handleChange}
                                        onBlur={handleBlur}
                                        InputProps={{ sx: { maxLength: 51 } }}
                                    />
                                </Grid>
                            </Grid>
                            <Grid container item xs={12} justifyContent={"space-between"} alignItems={"center"} sx={{ mt: "6vh" }}>
                                <Grid container item xs={12} sm={3.7}>
                                    <TextField
                                        fullWidth
                                        name="Initial_Message"
                                        id="Initial Message"
                                        type="text"
                                        placeholder="Initial Message"
                                        size="small"
                                        variant="standard"
                                        value={createChatbotData.Initial_Message}
                                        onChange={handleChange}
                                        onBlur={handleBlur}
                                        />
                                </Grid>
                                <Grid container item xs={12} sm={3.7}>
                                    <TextField
                                        fullWidth
                                        name="Helpdesk_Url"
                                        id="Helpdesk Url"
                                        type="text"
                                        placeholder="Helpdesk Url"
                                        size="small"
                                        variant="standard"
                                        value={createChatbotData.Helpdesk_Url}
                                        onChange={handleChange}
                                        onBlur={handleBlur}
                                    />
                                </Grid>
                                <Grid container item xs={12} sm={3.7}>
                                <ColorPickerInput initial={createChatbotData.Theme_Color} onChange={(e) => {setCreateChatbotData(prev => ({
                                    ...prev,
                                    Theme_Color: e
                                }))}}/>
                                </Grid>
                                <Grid container item xs={12} sm={3.7}></Grid> {/* Empty grid just for style consistency   */ }
                            </Grid>
                            <Grid container item xs={12} justifyContent={"space-between"} alignItems={"center"} sx={{ mt: "6vh" }}>
                                <Grid container item xs={12} sm={3.7}>
                                    <TextField
                                        fullWidth
                                        name="Privacy_Policy"
                                        id="Privacy Policy"
                                        type="text"
                                        multiline
                                        rows={3}
                                        placeholder="Privacy Policy"
                                        size="small"
                                        variant="standard"
                                        value={createChatbotData.Privacy_Policy}
                                        onChange={handleChange}
                                        onBlur={handleBlur}
                                        />
                                </Grid>
                                <Grid container item xs={12} sm={3.7}>
                                    <TextField
                                        fullWidth
                                        name="Initial_Context"
                                        id="Initial Context"
                                        type="text"
                                        multiline
                                        rows={3}
                                        placeholder="Initial Context"
                                        size="small"
                                        variant="standard"
                                        value={createChatbotData.Initial_Context}
                                        onChange={handleChange}
                                        onBlur={handleBlur}
                                        />
                                </Grid>
                                <Grid container item xs={12} sm={3.7}></Grid>
                                
                            </Grid>
                            
                            <Grid container item xs={12} sx={{ py: "2vh", my: "9vh" }} justifyContent={"center"} alignItems={"center"}>
                                <Grid item xs={5}>
                                    <Button
                                        fullWidth
                                        disabled={!createChatbotData.Chatbot_Name.length || !createChatbotData.Website_Sitemap_URL || !createChatbotData.Whitelist_Domain}
                                        variant="contained"
                                        onClick={onSubmitOfCreateChatbot}
                                        sx={{
                                            backgroundColor: !createChatbotData.Chatbot_Name.length || !createChatbotData.Website_Sitemap_URL || !createChatbotData.Whitelist_Domain ? '#F6F5FB' : cTheme.primaryFontColor,
                                            '&:hover': { backgroundColor: cTheme.primaryFontColor+" !important" }, batextTransform: "initial"
                                        }}
                                    >
                                        {createChatbotBtnloading ? <CircularProgress sx={{ color: "white" }} size={20} /> : 'CREATE CHATBOT'}
                                    </Button>
                                </Grid>
                            </Grid>
                        </Grid>                        
                        <ScriptComponent
                            open={open}
                            handleClose={handleClose}
                            chatbotId={chatbotId}
                            page='createChatbot'
                        />
                    </Grid>
                </Grid>
            </Grid>
            <SnakBarAlert alertOpen={alertOpen} setAlertOpen={setAlertOpen} alertSeverity={alertSeverity} alert={alert} />
        </div >
    )
}




