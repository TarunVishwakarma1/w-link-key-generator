'use client'
import React from "react";
import {Navbar, NavbarBrand, NavbarContent, NavbarItem, Link, Button, NavbarMenu,NavbarMenuItem, NavbarMenuToggle} from "@nextui-org/react";
import {Logo as AcmeLogo} from "./icons/Logo"
import ModeToggle from "./modeToggle"
import { motion } from "framer-motion";

export default function App() {

    const [isMenuOpen, setIsMenuOpen] = React.useState(false);

    const menuItems = [
        "Profile",
        "Dashboard",
        "Activity",
        "Analytics",
        "System",
        "Deployments",
        "My Settings",
        "Team Settings",
        "Help & Feedback",
        "Log Out",
      ];

  return (
    <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          >
    <Navbar shouldHideOnScroll onMenuOpenChange={setIsMenuOpen} >
    <NavbarContent>
        <NavbarMenuToggle aria-label={isMenuOpen?"Close menu":"Open menu"} className="sm:hidden"/>
      <NavbarBrand>
        <AcmeLogo />
        <p className="font-bold text-black dark:text-white">Wlink</p>
      </NavbarBrand>
    </NavbarContent>
      <NavbarContent className="hidden sm:flex gap-4" justify="center">
        <NavbarItem isActive>
          <Link href="#" aria-current="page" className="font-semibold text-xl">
            Wallet Generator Website
          </Link>
        </NavbarItem>
      </NavbarContent>
      <NavbarContent justify="end">
        <NavbarItem>
        
          <ModeToggle />
        
        </NavbarItem>
      </NavbarContent>
      <NavbarMenu>
      {menuItems.map((item, index) => (
          <NavbarMenuItem key={`${item}-${index}`}>
            <Link
              color={
                index === 2 ? "primary" : index === menuItems.length - 1 ? "danger" : "foreground"
              }
              className="w-full"
              href="#"
              size="lg"
            >
              {item}
            </Link>
          </NavbarMenuItem>
        ))}
      </NavbarMenu>
    </Navbar>
    </motion.div>
  );
}
