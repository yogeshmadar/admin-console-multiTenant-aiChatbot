// src/components/sidebar/sidebar.tsx
'use client'
import { AppBar, Box, Button, CircularProgress, CssBaseline, Drawer, Fab, Grid, List, ListItem, ListItemButton, ListItemText, SwipeableDrawer, Typography } from "@mui/material";
import MenuIcon from '@mui/icons-material/Menu';
import { usePathname, useRouter } from "next/navigation";
import Image from 'next/image';
import logo from '@/assets/login/logo.png'
import { getSession, signOut } from "next-auth/react";
import { useEffect, useState } from "react";
import { deleteCookie, getCookie, setCookie } from "cookies-next";
import page from '@/components/sidebar/page.module.css';
import { cTheme } from "@/theme/colorScheme";


export default function Sidebar({ Children }: any) {
    const [open, setOpen] = useState(false);
    const [isLinkLoading, setIsLinkLoading] = useState(false);
    const [selectedItem, setSelectedItem] = useState<number | null>(0);
    const [isLoading, setIsLoading] = useState(false);
    const [checkUser, setCheckUser] = useState(false);
    const sidebarItems = ['/chatbots', '/message_threads', '/admin_users']

    const pathname = usePathname();
    const { push } = useRouter();
    const drawerWidth = "17.35vw";

    const handleItemClick = (index: number) => {
        if (pathname !== sidebarItems[index]) {
            setIsLoading(true);
            push(sidebarItems[index] ?? '');
            setSelectedItem(index);
            setCookie('selectedItem', index.toString());
        }
    };

    const getSelectedItemFromCookies = () => {
        const storedItem = getCookie('selectedItem');
        const currentIndex = sidebarItems.findIndex(v => v === pathname)
        if (Number(storedItem) !== currentIndex) {
            setCookie('selectedItem', currentIndex.toString())
        }
        return currentIndex
    };

    useEffect(() => {
        setSelectedItem(getSelectedItemFromCookies());
        async function handleSidebarDisplay() {
            const session = await getSession();
            if (!session?.user) return setCheckUser(true);
            setCheckUser(false);
        }
        handleSidebarDisplay();
    }, [pathname]);

    useEffect(() => {
        const loadertimeout = setTimeout(() => {
            setIsLoading(false);
        }, 1000);
        return () => clearTimeout(loadertimeout);
    }, [pathname]);

    const toggleDrawer = (openState: any) => (event: any) => {
        if (
            event &&
            event.type === 'keydown' &&
            (event.key === 'Tab' || event.key === 'Shift')
        ) {
            return;
        }
        setOpen(openState);
    };

    var LogoImage = <ListItem onClick={toggleDrawer(false)} sx={{ px: 0 }}>
        <Grid container sx={{ my: "1vh" }} justifyContent={'center'} alignItems={'center'} >
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', width: '100%' }}  >
                <Image src={logo}
                    priority={true}
                    placeholder="empty"
                    alt="Chatbots"
                    style={{
                        objectFit: 'contain',
                        backgroundColor: "transparent",
                        borderRadius: "0.8rem",
                        maxWidth: "100%",
                        maxHeight: "100%",
                        width: "120px",
                        height: "120px",
                        marginBottom: "30px"
                    }}
                    unoptimized
                />
            </div>
        </Grid>
    </ListItem>

    return (
        <>
            {pathname == '/sign-in' || checkUser ? null :
                <div className={page["hidden-lg-block"]} >
                    <div style={{ display: "flex", flexDirection: "column", justifyContent: 'center', alignItems: 'center' }}>
                        <Box sx={{ display: 'flex' }}>
                            <CssBaseline />
                            {/* Keep AppBar in DOM but make it heightless so it doesn't reserve space */}
                            <AppBar
                                position="fixed"
                                sx={{
                                    width: drawerWidth,
                                    ml: "0.026",
                                    backgroundColor: "transparent",
                                    boxShadow: "none",
                                    height: 0,
                                    minHeight: 0,
                                    padding: 0,
                                    overflow: 'visible'
                                }}
                            >
                            </AppBar>

                            {/* Desktop permanent drawer: Slate-Gray Gradient */}
                            <Drawer
                                sx={{
                                    width: drawerWidth,
                                    flexShrink: 0,
                                    '& .MuiDrawer-paper': {
                                        width: drawerWidth,
                                        background: 'linear-gradient(180deg, #ECECEC 0%, #B8BDC6 100%)',
                                        boxSizing: 'border-box',
                                        display: 'flex',
                                        flexDirection: 'column',
                                        justifyContent: 'space-between',
                                        borderRight: '1px solid rgba(0,0,0,0.06)'
                                    },
                                }}
                                variant="permanent"
                                anchor="left"
                            >
                                <List sx={{ px: 2, pt: 2 }}>
                                    {LogoImage}
                                    {pathname == '/sign-in' ? null :
                                        <List>
                                            {["Chatbots", "Message Threads", "Admin Users"].map((text, index) => (
                                                <ListItem key={text} disablePadding sx={{
                                                    color: "#1E1E2A",
                                                    transition: 'all 0.18s ease',
                                                    "&:hover": { backgroundColor: '#D4D7DD', transform: 'translateX(3px)' },
                                                    backgroundColor: selectedItem === index ? '#8C93A3' : 'transparent',
                                                    borderRadius: "0.8rem",
                                                    p: "0.6rem", mb: "0.6rem",
                                                    justifyContent: 'space-between',
                                                    boxShadow: selectedItem === index ? 'inset 0 0 0 1px rgba(255,255,255,0.35)' : 'none'
                                                }}>
                                                    <ListItemButton
                                                        sx={{
                                                            "&:hover": { backgroundColor: "transparent" },
                                                            p: 0, m: 0, display: 'flex', alignItems: 'center', width: '100%',
                                                            gap: 1
                                                        }}
                                                        onClick={() => handleItemClick(
                                                            index
                                                        )} >
                                                        <ListItemText
                                                            primary={
                                                                <Typography variant="subtitle1" sx={{ margin: 0, fontWeight: selectedItem === index ? 700 : 600, color: selectedItem === index ? '#ffffff' : '#1E1E2A' }}>
                                                                    {text}
                                                                </Typography>
                                                            }
                                                            sx={{
                                                                margin: "0"
                                                            }}
                                                        />
                                                        {selectedItem === index && isLoading &&
                                                            <div>
                                                                <CircularProgress sx={{ color: "#ffffff" }} size={18} />
                                                            </div>}
                                                    </ListItemButton>
                                                </ListItem>
                                            ))}
                                        </List>
                                    }
                                </List>

                                {pathname == '/sign-in' ? null :
                                    <Grid container sx={{
                                        width: "100%", my: "1.5vw",
                                        display: 'flex', justifyContent: "center", alignItems: "center",
                                        px: 2, pb: 3
                                    }}
                                        onClick={() => {
                                            deleteCookie('chatbot_access_token');
                                            deleteCookie('first_name');
                                            deleteCookie('last_name');
                                            deleteCookie('selectedItem');
                                            signOut({ callbackUrl: '/' });
                                            setIsLinkLoading(true);
                                        }}>
                                        <Button
                                            variant="contained"
                                            className="cursor-pointer"
                                            sx={{
                                                textTransform: "initial",
                                                backgroundColor: '#687082',
                                                color: "#ffffff",
                                                width: '80%',
                                                '&:hover': { backgroundColor: '#555C6B' },
                                                boxShadow: '0 6px 16px rgba(1, 1, 1, 0.1)',
                                                borderRadius: '0.6rem',
                                                py: 1.1,
                                                fontWeight: 600,
                                                letterSpacing: '0.3px',
                                            }}>
                                            {isLinkLoading ? <CircularProgress sx={{ color: "white" }} size={25} /> : 'SIGN OUT'}
                                        </Button>
                                    </Grid>
                                }
                            </Drawer>

                            {/* Main content area */}
                            {/* <Box
                                component="main"
                                sx={{ flexGrow: 1, bgcolor: '#F6F5FB', minHeight: '100vh', p: { xs: 2, md: 3 } }}
                            >
                                {Children}
                            </Box> */}
                        </Box>
                    </div >
                </div >
            }
            {pathname == '/sign-in' ? null :
                <div className={page["block-lg-hidden"]}>
                    <div>
                        {/* Mobile drawer: use same slate gradient and unified styles */}
                        <SwipeableDrawer
                            anchor="left"
                            open={open}
                            onClose={toggleDrawer(false)}
                            onOpen={toggleDrawer(true)}
                            PaperProps={{ sx: { background: 'linear-gradient(180deg, #ECECEC 0%, #B8BDC6 100%)' } }}
                        >
                            <List className={`${page["list-container"]}`} sx={{ height: '100%', backgroundColor: 'transparent', px: 2, pt: 2 }}>
                                <Grid>
                                    {LogoImage}
                                    {pathname == '/sign-in' ? null :
                                        <List>
                                            {["Chatbots", "Message Threads", "Admin Users"].map((text, index) => (
                                                <ListItem key={text} disablePadding>
                                                    <ListItemButton
                                                        sx={{ "&:hover": { backgroundColor: "transparent" }, p: 0, m: 0 }}
                                                        onClick={() => handleItemClick(
                                                            index
                                                        )} >
                                                        <ListItemText
                                                            primary={
                                                                <Typography variant="subtitle1" sx={{
                                                                    color: selectedItem === index ? '#ffffff' : '#1E1E2A',
                                                                    display: 'inline-block',
                                                                    px: 2, py: 1,
                                                                    borderRadius: '0.6rem',
                                                                    width: '100%',
                                                                    backgroundColor: selectedItem === index ? '#8C93A3' : 'transparent',
                                                                    fontWeight: selectedItem === index ? 700 : 600
                                                                }}>
                                                                    {text}
                                                                </Typography>
                                                            }
                                                        />
                                                    </ListItemButton>
                                                </ListItem>
                                            ))}
                                        </List>
                                    }
                                </Grid>
                                {pathname == '/sign-in' ? null :
                                    <Grid container sx={{ width: "100%", my: "1.5vw", display: 'flex', justifyContent: "center", alignItems: "center", px: 2, pb: 3 }}
                                        onClick={() => {
                                            deleteCookie('chatbot_access_token');
                                            signOut({ callbackUrl: '/' });
                                            setIsLinkLoading(true);
                                        }}>
                                        <Button variant="contained" className="cursor-pointer" sx={{
                                            textTransform: "initial",
                                            backgroundColor: '#687082',
                                            color: "white",
                                            width: '80%',
                                            '&:hover': { backgroundColor: '#555C6B' },
                                            boxShadow: '0 6px 16px rgba(0,0,0,0.1)',
                                            borderRadius: '0.6rem',
                                            py: 1.1,
                                            fontWeight: 600
                                        }}>
                                            {isLinkLoading ? <CircularProgress sx={{ color: "white" }} size={25} /> : 'SIGN OUT'}
                                        </Button>
                                    </Grid>
                                }
                            </List>
                        </SwipeableDrawer>
                        <Fab
                            aria-label="menu"
                            onClick={() => { setOpen(!open) }}
                            sx={{
                                position: 'fixed',
                                bottom: '16px',
                                left: '16px',
                                zIndex: 1300,
                                backgroundColor: "white",
                                boxShadow: '0 6px 18px rgba(13,23,34,0.08)'
                            }}
                        >
                            <MenuIcon sx={{ color: '#2A2F42', fontWeight: '600' }} />
                        </Fab>
                    </div>
                </div>
            }
        </>
    )
}
