

export type UserType = {
    username: string
    isReady: boolean
    uuid: string
    sign: number
}

export type RoomType = {
    usersCount: number
    name: string
    uuid: string
    stage: number
}

export type RoomItemProps = {
    name: string,
    users: number
    joinRoom: () => void
}

export type HomeProps = {
    joinRoom: (uuid: string) => void
    users: UserType[]
    rooms: RoomType[]
    username: string
    createRoom: () => void
}

export type GameCoreProps = {
    username: string
    setUserName: React.Dispatch<React.SetStateAction<string>>
}

export type RoomProps = {
    roomName: string
    leaveRoom: () => void
    changeReady: () => void
    user: UserType
    users: UserType[]
}

export type UserItemProps = {
    username: string
    isReady: boolean
}

export type GameProps = {
    self: UserType
    users: UserType[]
    catcher: UserType
    flagHolder: UserType
    sendSign: (sign: number[][]) => void
  }

export type GameType = {
    stage: number
    catcher: UserType
    flagHolder: UserType
    score: number
}