export interface IAttendant {
    identity: string
    fullName: string
    email: string
    teams: string[]
    agentSlots: number
    isEnabled: boolean
}