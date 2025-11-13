'use client'

import { Avatar, Box, Button, CircularProgress, Dialog, DialogContent, DialogContentText, DialogTitle, Grid, TextField, Typography } from "@mui/material";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import page from '@/components/sidebar/page.module.css';
import SnakBarAlert from "@/components/snakbarAlert/snackbarAlert";
import React from "react";
import PopperComponent from "@/components/popperComponent/popperComponent";
import DeleteIcon from '@mui/icons-material/Delete';
import ScriptComponent from "@/components/popperComponent/scriptComponent";
import BackDropLoading from "@/components/loading/backDropLoading";
import "react-color-palette/css";
import ColorPickerInput from "@/components/ColorPickerInput/ColorPickerInput";
import { cTheme } from "@/theme/colorScheme";

export default function EditChatBot(props: any) {
    const [isAllChatbotBtnLoader, setIsAllChatbotBtnLoader] = useState(false);
    const [updateChatbotBtnLoading, setupdateChatbotBtnLoading] = useState<Boolean>(false);
    const [deleteChatbotBtnLoading, setDeleteChatbotBtnLoading] = useState<Boolean>(false);
    const [cancelBtnLoading, setCancelBtnLoading] = useState<Boolean>(false);
    const [isRefreshBtnLoader, setIsRefreshBtnLoader] = useState<Boolean>(false);
    const [isPageLoading, setIsPageLoading] = useState<Boolean>(false);
    const [alert, setAlert] = useState("");
    const [alertOpen, setAlertOpen] = useState(false);
    const [alertSeverity, setAlertSeverity] = useState(false);
    const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
    const [openLog, setOpenLog] = React.useState(false);
    const [updateChatbotData, setUpdateChatbotData] = useState({
        Chatbot_Name: '',
        Website_Sitemap_URL: '',
        Privacy_Policy: '',
        Whitelist_Domain: '',
        Theme_Color: '',
        Initial_Message: '',
        Helpdesk_Url: '',
        Initial_Context: ''
    });
    const [errors, setErrors] = useState({
        Chatbot_Name: '',
        Website_Sitemap_URL: '',
        Privacy_Policy: '',
        Whitelist_Domain: '',
        Theme_Color: '',
        Initial_Message: '',
        Helpdesk_Url: '',
        Crawl_Error: '',
        Initial_Context: ''
    });
    const [open, setOpen] = React.useState(false);
    const handleOpen = () => setOpen(true);
    const handleClose = () => setOpen(false);

    const { push } = useRouter();
    const popperOpen = Boolean(anchorEl);
    const id = popperOpen ? 'simple-popper' : undefined;

    const handleClick = (event: any) => {
        setAnchorEl(anchorEl ? null : event.currentTarget);
    };

    const handleChange = (e: any) => {
        const { name, value } = e.target;
        let error = '';
        let maxLength = name === 'Website_Sitemap_URL' ? 100 : 500;
        if (value.length <= maxLength) {
            setUpdateChatbotData({ ...updateChatbotData, [name]: value });
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

    const editChatbotAPI = async () => {
        const requestBody = {
            bot_name: updateChatbotData.Chatbot_Name,
            description: '',
            theme_color: updateChatbotData.Theme_Color,
            sitemap_url: updateChatbotData.Website_Sitemap_URL,
            privacy_policy: updateChatbotData.Privacy_Policy,
            whitelist_domain: updateChatbotData.Whitelist_Domain,
            initial_message: updateChatbotData.Initial_Message,
            helpdesk_url: updateChatbotData.Helpdesk_Url,
            initial_context: updateChatbotData.Initial_Context,
            is_active: true
        }
        try {
            setupdateChatbotBtnLoading(true);
            const response = await fetch(`/api/chatbots/${props.params.chatbot_uuid}`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(requestBody),
            });
            const updateChatbotByIdAPIResponse = await response.json();
            if (response.status == 200) {
                setupdateChatbotBtnLoading(false);
                AlertManager(updateChatbotByIdAPIResponse?.message, false);
                push('/chatbots');
            }
            else if(response.status === 500) {
                AlertManager("Sorry, there is a problem with the server. Try again later", true)
            }
            else {
                AlertManager(updateChatbotByIdAPIResponse?.message, true);
            }
        }
        catch (error: any) {
            AlertManager("Sorry, there is a problem with the server. Try again later", true)
        }
    }

    async function getChatbotById() {
        setIsPageLoading(true);
        try {
            const response = await fetch(`/api/chatbots/${props.params.chatbot_uuid}`, {
                method: 'GET',
                cache: 'no-cache',
                headers: {
                    'Content-Type': 'applicaton/json'
                }
            })
            const getChatbotById = await response.json();
            if (response.status == 200) {
                setUpdateChatbotData({
                    ...updateChatbotData, Chatbot_Name: getChatbotById?.data?.bot_name || '',
                    Website_Sitemap_URL: getChatbotById?.data?.sitemap_url || '',
                    Privacy_Policy: getChatbotById?.data?.privacy_policy || '',
                    Whitelist_Domain: getChatbotById?.data?.whitelist_domain || '',
                    Theme_Color: getChatbotById?.data?.theme_color || '',
                    Helpdesk_Url: getChatbotById?.data?.helpdesk_url || '',
                    Initial_Message: getChatbotById?.data?.initial_message || '',
                    Initial_Context: getChatbotById?.data?.initial_context || '',
                })
                if(getChatbotById?.data?.crawl_error) {
                    setErrors(prev => ({
                        ...prev,
                        Crawl_Error: getChatbotById?.data?.crawl_error || ''
                    }))
                }
                // setColor(updateChatbotData.theme_color || '');
                AlertManager(getChatbotById?.message, false);
            }
            else if(response.status === 500) {
                AlertManager("Sorry, there is a problem with the server. Try again later", true)
            }
            else {
                AlertManager(getChatbotById?.message, true);
            }
        }
        catch (error: any) {
            AlertManager("Sorry, there is a problem with the server. Try again later", true);
        }
    }

    async function deleteChatbotAPI() {
        try {
            setDeleteChatbotBtnLoading(true);
            const response = await fetch(`/api/chatbots/${props.params.chatbot_uuid}`, {
                method: "DELETE",
                headers: {
                    "Content-Type": "application/json",
                },
            });
            const deleteChatbotResponse = await response.json();

            if (response.status == 200) {
                AlertManager(deleteChatbotResponse?.message, false);
                setAnchorEl(null);
                push('/chatbots');
            }
            
            else if(response.status === 500) {
                AlertManager("Sorry, there is a problem with the server. Try again later", true)
            }
            else {
                AlertManager(deleteChatbotResponse?.message, true);
            }
        }
        catch (error: any) {
            AlertManager("Sorry, there is a problem with the server. Try again later", true);
        }
    }

    async function crawlRefreshAPI() {
        try {
            setIsRefreshBtnLoader(true);
            const response = await fetch(`/api/chatbots/${props.params.chatbot_uuid}/crawl-refresh`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
            });
            const crawlRefreshAPIResponse = await response.json();
            if (response.status == 200) {
                AlertManager(crawlRefreshAPIResponse?.message, false);
            }
            else if(response.status === 500) {
                AlertManager("Sorry, there is a problem with the server. Try again later", true)
            }
            else {
                AlertManager(crawlRefreshAPIResponse?.message, true);
            }
        }
        catch (error: any) {
            AlertManager("Sorry, there is a problem with the server. Try again later", true);
        }
    }

    useEffect(() => {
        getChatbotById();
    }, [])


    function AlertManager(message: string, severity: boolean) {
        setAlert(message);
        setAlertSeverity(severity);
        setAlertOpen(true);
        setupdateChatbotBtnLoading(false);
        setDeleteChatbotBtnLoading(false);
        setIsRefreshBtnLoader(false);
        setIsPageLoading(false);
    }

    return (
        <div className={`${page["custom-container"]}`} style={{ backgroundColor: "#F6F5FB", paddingBottom: '5vh', minHeight: '100vh' }}>
            <Grid container item xs={12} justifyContent={'flex-start'} alignItems={'center'} sx={{ pl: 3 }}>
                <Grid container item xs={11.5} alignItems={'flex-start'} justifyContent={'center'} sx={{ backgroundColor: 'white', borderRadius: '2vh', p: 2, mt: "5vh", minHeight: "90vh" }} >
                    <Grid container item xs={12} direction="row" justifyContent={"center"} alignItems={"center"} >
                        <Grid container item xs={12} justifyContent={"center"} alignItems={"center"} sx={{ mb: "2vh" }}>
                            <Grid container item xs={12} sm={6} md={7} lg={8} >
                                <Grid item xs={12} sm={3.5} md={3.5} lg={2.5} xl={2}  >
                                    <Typography variant="body1" sx={{ fontWeight: "700", color: cTheme.primaryFontColor }}> Edit Chatbot</Typography>
                                </Grid>
                            </Grid>
                            <Grid container item xs={12} sm={6} md={5} lg={4} justifyContent='space-between' alignItems={'center'} >
                                <Grid item xs={5.7} >
                                    <Button
                                        fullWidth
                                        variant="contained"
                                        onClick={() => { crawlRefreshAPI() }}
                                        sx={{ textTransform: "initial", backgroundColor: cTheme.primaryFontColor, borderRadius: "1vh !important", color: "#F0F2FF", fontWeight: "700", p: "1.2vh", '&:hover': { backgroundColor: cTheme.primaryBackground } }}
                                    >
                                        {isRefreshBtnLoader ?
                                            <CircularProgress sx={{ color: 'white' }} size={20} /> :
                                            <>
                                                <Typography variant="caption" sx={{ fontWeight: "700" }}>REFRESH SITEMAP</Typography>
                                            </>
                                        }
                                    </Button>
                                </Grid>
                                <Grid item  xs={5.7} >
                                    <Button
                                        fullWidth
                                        variant="contained"
                                        onClick={handleOpen}
                                        sx={{ textTransform: "initial", backgroundColor: cTheme.primaryFontColor, borderRadius: "1vh !important", color: "#F0F2FF", fontWeight: "700", p: "1.2vh", '&:hover': { backgroundColor: cTheme.primaryBackground } }}
                                    >
                                        {isAllChatbotBtnLoader ?
                                            <CircularProgress sx={{ color: 'white' }} size={20} /> :
                                            <>
                                                <Typography variant="caption" sx={{ fontWeight: "700" }}>VIEW SCRIPT</Typography>
                                            </>
                                        }
                                    </Button>
                                </Grid>
                            </Grid>
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
                                        value={updateChatbotData.Chatbot_Name}
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
                                        value={updateChatbotData.Website_Sitemap_URL}
                                        error={!!errors.Website_Sitemap_URL}
                                        helperText={errors.Website_Sitemap_URL}
                                        // onChange={handleChange}
                                        // onBlur={handleBlur}
                                        InputProps={{ readOnly: true, sx: { maxLength: 100 } }}
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
                                        value={updateChatbotData.Whitelist_Domain}
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
                                        id="HTML Node"
                                        type="text"
                                        placeholder="Initial Message"
                                        size="small"
                                        variant="standard"
                                        value={updateChatbotData.Initial_Message}
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
                                        value={updateChatbotData.Helpdesk_Url}
                                        onChange={handleChange}
                                        onBlur={handleBlur}
                                        InputProps={{ sx: { maxLength: 51 } }}
                                    />
                                </Grid>
                                <Grid container item xs={12} sm={3.7}>
                                <ColorPickerInput initial={updateChatbotData.Theme_Color} onChange={(e) => {setUpdateChatbotData(prev => ({
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
                                        value={updateChatbotData.Privacy_Policy}
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
                                        value={updateChatbotData.Initial_Context}
                                        onChange={handleChange}
                                        onBlur={handleBlur}
                                        />
                                </Grid>
                                <Grid container item xs={12} sm={3.7}></Grid>
                            </Grid>
                            {
                                errors.Crawl_Error !== '' &&
                                    (<Box sx={{ display:'flex', gap: '3px', mt: "6vh", width: '100%' }}>
                                        <Typography sx={{ fontWeight: '600', color: 'red', fontSize: "10px" }}>Failed to crawl the sitemap url.</Typography>
                                        <Typography
                                        onClick={()=> setOpenLog(true)}
                                        sx={{ textDecoration: 'underline', cursor: 'pointer' ,fontWeight: '600', color: 'red', fontSize: "10px" }}>Read full log</Typography>
                                    </Box>)
                            }
                            <Grid container item xs={12} direction={'row'} sx={{ py: "2vh", my: "9vh" }} justifyContent={"space-between"} alignItems={"center"}>
                                <Grid container item xs={7} justifyContent={'flex-end'} alignItems={'center'}>
                                    <Grid item xs={12} md={8}>
                                        <Button
                                            fullWidth
                                            disabled={!updateChatbotData.Chatbot_Name.length || !updateChatbotData.Website_Sitemap_URL || !updateChatbotData.Whitelist_Domain || !updateChatbotData.Theme_Color}
                                            variant="contained"
                                            onClick={editChatbotAPI}
                                            sx={{
                                                backgroundColor: !updateChatbotData.Chatbot_Name.length || !updateChatbotData.Website_Sitemap_URL || !updateChatbotData.Whitelist_Domain || !updateChatbotData.Theme_Color ? '#F6F5FB' : cTheme.primaryFontColor,
                                                '&:hover': { backgroundColor: cTheme.primaryFontColor + '!important' }, batextTransform: "initial"
                                            }}
                                        >
                                            {updateChatbotBtnLoading ? <CircularProgress sx={{ color: "white" }} size={20} /> : 'UPDATE CHATBOT'}
                                        </Button>
                                    </Grid>
                                </Grid>
                                <Grid container item xs={4.8} justifyContent={'flex-start'} alignItems={'center'}>
                                    <Grid item xs={12} sm={6} lg={4.2}>
                                        <Button
                                            fullWidth
                                            variant="contained"
                                            onClick={() => { setCancelBtnLoading(true); push('/chatbots') }}
                                            sx={{
                                                backgroundColor: cTheme.primaryFontColor + '!important',
                                                '&:hover': { backgroundColor: cTheme.primaryFontColor + '!important' }, batextTransform: "initial"
                                            }}
                                        >
                                            {cancelBtnLoading ? <CircularProgress sx={{ color: "white" }} size={20} /> : 'CANCEL'}
                                        </Button>
                                    </Grid>
                                </Grid>
                            </Grid>
                            <ScriptComponent
                                open={open}
                                handleClose={handleClose}
                                chatbotId={props.params.chatbot_uuid}
                            />
                        </Grid>
                    </Grid>
                    <Grid container item xs={12} justifyContent={"flex-end"} alignItems={"center"}>
                        <Avatar sx={{ mr: "3vh", cursor: 'pointer' }} aria-describedby={id} onClick={handleClick} >
                            <DeleteIcon sx={{ color: "red" }} />
                        </Avatar>
                        <PopperComponent
                            id={id}
                            open={popperOpen}
                            anchorEl={anchorEl}
                            setAnchorEl={setAnchorEl}
                            chatbot_uuid={props.params.chatbot_uuid}
                            deleteChatbotAPI={deleteChatbotAPI}
                            deleteChatbotBtnLoading={deleteChatbotBtnLoading}
                            setDeleteChatbotBtnLoading={setDeleteChatbotBtnLoading} />
                    </Grid>
                </Grid>
            </Grid>
            <Dialog
                open={openLog}
                onClose={()=> setOpenLog(false)}
                scroll='paper'
                aria-labelledby="scroll-dialog-title"
                aria-describedby="scroll-dialog-description"
            >
                <DialogTitle id="scroll-dialog-title">Error log</DialogTitle>
                <DialogContent dividers={true}>
                <DialogContentText
                    id="scroll-dialog-description"
                    tabIndex={-1}
                >
                    {errors.Crawl_Error}
                </DialogContentText>
                </DialogContent>
            </Dialog>
            <SnakBarAlert alertOpen={alertOpen} setAlertOpen={setAlertOpen} alertSeverity={alertSeverity} alert={alert} />
            <BackDropLoading isLoading={isPageLoading} />
        </div>
    )
}




