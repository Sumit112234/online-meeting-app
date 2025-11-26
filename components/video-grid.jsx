"use client"

import { ParticipantTile } from "./participant-tile"
import { cn } from "@/lib/utils"

export function VideoGrid({ participants, localStream, remoteStreams, currentUserId, pinnedUserId, onPinUser }) {
  const allParticipants = participants || []
  const participantCount = allParticipants.length

  const getGridClass = () => {
    if (participantCount === 1) return "grid-cols-1"
    if (participantCount === 2) return "grid-cols-1 md:grid-cols-2"
    if (participantCount <= 4) return "grid-cols-1 sm:grid-cols-2"
    if (participantCount <= 6) return "grid-cols-2 md:grid-cols-3"
    if (participantCount <= 9) return "grid-cols-2 md:grid-cols-3"
    return "grid-cols-2 md:grid-cols-3 lg:grid-cols-4"
  }

  if (pinnedUserId) {
    const pinnedParticipant = allParticipants.find((p) => p.uid === pinnedUserId)
    const otherParticipants = allParticipants.filter((p) => p.uid !== pinnedUserId)

    return (
      <div className="flex flex-col md:flex-row gap-2 md:gap-4 h-full p-2 md:p-4">
        {/* Main pinned video */}
        <div className="flex-1 min-h-[300px] md:min-h-0">
          <ParticipantTile
            participant={pinnedParticipant}
            stream={pinnedParticipant?.uid === currentUserId ? localStream : remoteStreams[pinnedParticipant?.uid]}
            isLocal={pinnedParticipant?.uid === currentUserId}
            isPinned={true}
            onPin={() => onPinUser(null)}
          />
        </div>

        {/* Sidebar with other participants */}
        {otherParticipants.length > 0 && (
          <div className="w-full md:w-48 lg:w-72 flex md:flex-col gap-2 overflow-x-auto md:overflow-y-auto pb-2 md:pb-0">
            {otherParticipants.map((participant) => (
              <div key={participant.uid} className="min-w-[200px] md:min-w-0 aspect-video">
                <ParticipantTile
                  participant={participant}
                  stream={participant.uid === currentUserId ? localStream : remoteStreams[participant.uid]}
                  isLocal={participant.uid === currentUserId}
                  onPin={() => onPinUser(participant.uid)}
                />
              </div>
            ))}
          </div>
        )}
      </div>
    )
  }

  return (
    <div className={cn("grid gap-2 md:gap-4 h-full w-full p-2 md:p-4 auto-rows-fr overflow-y-auto", getGridClass())}>
      {allParticipants.map((participant) => (
        <ParticipantTile
          key={participant.uid}
          participant={participant}
          stream={participant.uid === currentUserId ? localStream : remoteStreams[participant.uid]}
          isLocal={participant.uid === currentUserId}
          onPin={() => onPinUser(participant.uid)}
        />
      ))}
    </div>
  )
}


// "use client"

// import { ParticipantTile } from "./participant-tile"
// import { cn } from "@/lib/utils"

// export function VideoGrid({ participants, localStream, remoteStreams, currentUserId, pinnedUserId, onPinUser }) {
//   const allParticipants = participants || []
//   const participantCount = allParticipants.length

//   // Grid layout based on participant count
//   const getGridClass = () => {
//     if (participantCount === 1) return "grid-cols-1"
//     if (participantCount === 2) return "grid-cols-2"
//     if (participantCount <= 4) return "grid-cols-2"
//     if (participantCount <= 6) return "grid-cols-3"
//     if (participantCount <= 9) return "grid-cols-3"
//     return "grid-cols-4"
//   }

//   const getGridRows = () => {
//     if (participantCount <= 3) return "grid-rows-1"
//     if (participantCount <= 6) return "grid-rows-2"
//     if (participantCount <= 9) return "grid-rows-3"
//     return "grid-rows-4"
//   }

//   // If someone is pinned, show them large with others in sidebar
//   if (pinnedUserId) {
//     const pinnedParticipant = allParticipants.find((p) => p.uid === pinnedUserId)
//     const otherParticipants = allParticipants.filter((p) => p.uid !== pinnedUserId)

//     return (
//       <div className="flex gap-4 h-full">
//         {/* Main pinned video */}
//         <div className="flex-1">
//           <ParticipantTile
//             participant={pinnedParticipant}
//             stream={pinnedParticipant.uid === currentUserId ? localStream : remoteStreams[pinnedParticipant.uid]}
//             isLocal={pinnedParticipant.uid === currentUserId}
//             isPinned={true}
//             onPin={() => onPinUser(null)}
//           />
//         </div>

//         {/* Sidebar with other participants */}
//         {otherParticipants.length > 0 && (
//           <div className="w-72 space-y-4 overflow-y-auto">
//             {otherParticipants.map((participant) => (
//               <div key={participant.uid} className="aspect-video">
//                 <ParticipantTile
//                   participant={participant}
//                   stream={participant.uid === currentUserId ? localStream : remoteStreams[participant.uid]}
//                   isLocal={participant.uid === currentUserId}
//                   onPin={() => onPinUser(participant.uid)}
//                 />
//               </div>
//             ))}
//           </div>
//         )}
//       </div>
//     )
//   }

//   // Regular grid view
//   return (
//     <div className={cn("grid gap-4 h-full w-full p-4 auto-rows-fr", getGridClass(), getGridRows())}>
//       {allParticipants.map((participant) => (
//         <ParticipantTile
//           key={participant.uid}
//           participant={participant}
//           stream={participant.uid === currentUserId ? localStream : remoteStreams[participant.uid]}
//           isLocal={participant.uid === currentUserId}
//           onPin={() => onPinUser(participant.uid)}
//         />
//       ))}
//     </div>
//   )
// }
