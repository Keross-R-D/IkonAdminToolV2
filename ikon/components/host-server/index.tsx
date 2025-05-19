'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/shadcn/ui/dropdown-menu'
import { Input } from '@/shadcn/ui/input'
import { Label } from '@/shadcn/ui/label'
import { ChevronDown, ChevronUp } from 'lucide-react'
import { create } from 'zustand'
import AddEnv, { useEnvStore } from '../Add-Env'
import { setCookieSession } from '@/ikon/utils/cookieSession'

type HostServerStore = {
  hostServer: string
  setHostServer: (value: string) => void
}

export const useHostServer = create<HostServerStore>((set) => ({
  hostServer: 'local',
  setHostServer: (value) => set({ hostServer: value }),
}))

export default function HostServer() {
  const { hostServer, setHostServer } = useHostServer()
  const [open, setOpen] = useState(false)
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [loginError, setLoginError] = useState('')
  const { envs, setEnvs } = useEnvStore()

  useEffect(() => {
    if (open && envs.length === 0) {
      setEnvs([
        { server: 'local', link: '' },
        { server: 'dev', link: '' },
        { server: 'prod', link: '' },
      ])
    }
  }, [open, envs, setEnvs])

  const handleLogin = async (server: string) => {
    let host = "";
    debugger
    if (server === 'local') {
      setHostServer(server)
      setOpen(false)
      setLoginError('')
      setUsername('')
      setPassword('')
    } else {
      host = "https://ikoncloud-dev.keross.com/ikon-api"
    }
      const loginDetails = {
        password: password,
        userlogin: username,
        credentialType: "PASSWORD",
      };
  
      const url = `${host}/platform/auth/login`;
  console.log(url)
  console.log(loginDetails)
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(loginDetails),
      });
  
      const data = await response.json()
      console.log(data)
  debugger
      const { accessToken, refreshToken, expiresIn, refreshExpiresIn } = data;
     await setCookieSession("accessToken", accessToken, { maxAge: expiresIn });
     await setCookieSession("refreshToken", refreshToken, { maxAge: refreshExpiresIn });
      if (response.ok) {
        setHostServer(server)
        setOpen(false)
        setLoginError('')
        setUsername('')
        setPassword('')
      } else {
        setLoginError(data.error || 'Login failed')
      }
    
  }

  const changeEnv = (value: string) => {
    setHostServer(value)
    if (value === 'local') {
      setOpen(false)
      setUsername('')
      setPassword('')
      setLoginError('')
    } else {
      setUsername('')
      setPassword('')
      setLoginError('')
    }
  }

  return (
    <DropdownMenu
    open={open}
    onOpenChange={(val) => {
      // only allow closing when it's local or user is already logged in
      if (hostServer === 'local' || val === true) {
        setOpen(val)
      }
    }}
  >
  
      <DropdownMenuTrigger asChild>
        <Button variant="outline" >
          Env: {hostServer}
          <div className="flex items-center ml-2">
            <DropdownMenuSeparator className="w-px h-5 bg-gray-300 mx-1" />
            {open ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </div>
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent className="min-w-[22rem] p-4 space-y-4">
        <div className="flex items-center justify-between">
          <DropdownMenuLabel className="text-base font-semibold">
            Host Server
          </DropdownMenuLabel>
          <AddEnv />
        </div>

        <DropdownMenuSeparator />

        <DropdownMenuRadioGroup
          value={hostServer}
          onValueChange={setHostServer}
          className="space-y-2"
        >
          {envs.map((env, index) => (
            <div key={index}>
              <DropdownMenuRadioItem value={env.server}>
                {env.server}
              </DropdownMenuRadioItem>

              {hostServer === env.server && hostServer !== 'local' && (
                <div className="pt-2 border-t mt-2 space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="username">Username</Label>
                    <Input
                      id="username"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      placeholder="Enter your username"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="password">Password</Label>
                    <Input
                      id="password"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter your password"
                    />
                  </div>

                  {loginError && (
                    <p className="text-sm text-red-500">{loginError}</p>
                  )}

                  <Button
                    className="w-full mt-2"
                    onClick={() => handleLogin(env.server)}
                  >
                    Login
                  </Button>
                </div>
              )}
            </div>
          ))}
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
