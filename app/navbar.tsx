"use client"

import { UserButton } from "@clerk/nextjs"
import {
  Navbar, 
  NavbarBrand, 
  NavbarContent, 
  NavbarItem,
  Divider
} from "@heroui/react"

export default function AppNavbar() {
  return (
    <div>
      <Navbar className="pt-4 pb-4 w-full">
        <NavbarBrand>
          <p className="font-bold text-inherit">Wichteln</p>
        </NavbarBrand>
        <NavbarContent className="hidden sm:flex gap-4" justify="center">
          <NavbarItem>
            <p>Wichteln</p>
          </NavbarItem>
        </NavbarContent>
        <NavbarContent justify="end">
          <NavbarItem>
            <UserButton />
          </NavbarItem>
        </NavbarContent>
      </Navbar>
      <Divider className="mb-4" style={{ borderColor: "#FFFFFF20" }}/>
    </div>
  );
}
