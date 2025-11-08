```
[Requesting] Received request for path: /login
Requesting.request { username: 'lara_test', password: 'testtest', path: '/login' } => { request: '019a619f-30f4-750d-8ef5-2d72ba35db57' }
UserAuthentication.authenticate { username: 'lara_test', password: 'testtest' } => { user: '019a0427-0b08-7b94-90ca-0c727c6f3a69' }
Sessioning.create { user: '019a0427-0b08-7b94-90ca-0c727c6f3a69' } => { session: '019a619f-3172-7965-90cf-d26bbadd6658' }
Requesting.respond {
  request: '019a619f-30f4-750d-8ef5-2d72ba35db57',
  session: '019a619f-3172-7965-90cf-d26bbadd6658'
} => { request: '019a619f-30f4-750d-8ef5-2d72ba35db57' }
[Requesting] Received request for path: /UserInterest/_getPersonalInterests
Requesting.request {
  session: '019a619f-3172-7965-90cf-d26bbadd6658',
  path: '/UserInterest/_getPersonalInterests'
} => { request: '019a619f-34e1-7489-b189-3d63d7791940' }
Requesting.respond {
  request: '019a619f-34e1-7489-b189-3d63d7791940',
  results: [
    {
      _id: '019a2876-479f-7587-a931-2863c4c428c5',
      user: '019a0427-0b08-7b94-90ca-0c727c6f3a69',
      tag: 'Recycling'
    },
    {
      _id: '019a60af-d8b6-71cb-bca4-86426e4fc7b3',
      user: '019a0427-0b08-7b94-90ca-0c727c6f3a69',
      tag: 'Technology'
    },
    {
      _id: '019a6185-c288-778c-8560-595170b9219e',
      user: '019a0427-0b08-7b94-90ca-0c727c6f3a69',
      tag: 'Book'
    }
  ]
} => { request: '019a619f-34e1-7489-b189-3d63d7791940' }
[Requesting] Received request for path: /Event/_getEventsByRecommendationContext
Requesting.request {
  session: '019a619f-3172-7965-90cf-d26bbadd6658',
  filters: 'Recycling,Technology,Book',
  priorities: 'upcoming',
  path: '/Event/_getEventsByRecommendationContext'
} => { request: '019a619f-36f4-7d00-874a-76d93430aa1f' }
🤖 Requesting AI-augmented recommendations from LLM...
✅ Received response from LLM!
🤖 RAW LLM RESPONSE
======================
```json
{
  "recommendations": [
    {
      "name": "Women in Tech Networking Night",
      "reason": "This event is upcoming and aligns with the 'Technology' filter. It also prioritizes connecting professionals in the tech scene."
    },
    {
      "name": "Book Swap",
      "reason": "This event is upcoming and directly matches the 'Book' filter. It's a great opportunity to exchange books."
    },
    {
      "name": "Film Screening: Future Cities",
      "reason": "This event is upcoming, discusses 'Technology' shaping sustainable cities, and is relevant to broader 'Recycling' and sustainability themes."
    }
  ]
}
```
======================
📝 Applying LLM recommendations...
✅ Recommended "Women in Tech Networking Night" (This event is upcoming and aligns with the 'Technology' filter. It also prioritizes connecting professionals in the tech scene.)
✅ Recommended "Book Swap" (This event is upcoming and directly matches the 'Book' filter. It's a great opportunity to exchange books.)
✅ Recommended "Film Screening: Future Cities" (This event is upcoming, discusses 'Technology' shaping sustainable cities, and is relevant to broader 'Recycling' and sustainability themes.)
Requesting.respond {
  request: '019a619f-36f4-7d00-874a-76d93430aa1f',
  results: [
    {
      _id: '019a27b5-1b01-7c15-b048-4ca71e18431e',
      organizer: '019a0427-0b08-7b94-90ca-0c727c6f3a69',
      name: 'Women in Tech Networking Night',
      date: 2025-11-15T23:00:00.000Z,
      duration: 60,
      location: 'HubSpot HQ, Cambridge, MA',
      description: 'An evening to connect women and nonbinary professionals in the Boston tech scene.',
      status: 'upcoming'
    },
    {
      _id: '019a617b-2394-7e75-9630-075fbf76d9a6',
      organizer: '019a0427-0b08-7b94-90ca-0c727c6f3a69',
      name: 'Book Swap',
      date: 2025-11-21T19:00:00.000Z,
      duration: 60,
      location: 'Hayden Library',
      description: 'Bring a book you’ve finished and exchange it for something new! A cozy event with light snacks, discussion tables, and a “blind date with a book” raffle.',
      status: 'upcoming'
    },
    {
      _id: '019a27b4-1b28-7804-a4cb-4630f02ff044',
      organizer: '019a0427-0b08-7b94-90ca-0c727c6f3a69',
      name: 'Film Screening: Future Cities',
      date: 2025-11-07T01:30:00.000Z,
      duration: 60,
      location: 'Coolidge Corner Theatre, Brookline, MA',
      description: 'A documentary exploring the technology shaping the sustainable cities of tomorrow.',
      status: 'completed'
    }
  ],
  error: null
} => { request: '019a619f-36f4-7d00-874a-76d93430aa1f' }
[Requesting] Received request for path: /Event/_getEventsByStatus
Requesting.request {
  session: '019a619f-3172-7965-90cf-d26bbadd6658',
  status: 'upcoming',
  path: '/Event/_getEventsByStatus'
} => { request: '019a619f-3c63-7e7f-8732-12bff4fc8e88' }
Requesting.respond {
  request: '019a619f-3c63-7e7f-8732-12bff4fc8e88',
  results: [
    {
      _id: '019a27b5-1b01-7c15-b048-4ca71e18431e',
      organizer: '019a0427-0b08-7b94-90ca-0c727c6f3a69',
      name: 'Women in Tech Networking Night',
      date: 2025-11-15T23:00:00.000Z,
      duration: 60,
      location: 'HubSpot HQ, Cambridge, MA',
      description: 'An evening to connect women and nonbinary professionals in the Boston tech scene.',
      status: 'upcoming'
    },
    {
      _id: '019a617a-0ab4-735f-b7c2-ccbdd38f234f',
      organizer: '019a0427-0b08-7b94-90ca-0c727c6f3a69',
      name: 'Late Night Study Break',
      date: 2025-11-12T22:00:00.000Z,
      duration: 60,
      location: 'Student Center',
      description: 'Take a break from midterms! Stop by the student center for free pizza, games, and trivia. Open to all undergrads — bring your friends and de-stress before exams.',
      status: 'upcoming'
    },
    {
      _id: '019a617a-93cd-7ad2-8860-8ac6834fede0',
      organizer: '019a0427-0b08-7b94-90ca-0c727c6f3a69',
      name: 'Intramural Soccer Finals',
      date: 2025-11-18T00:00:00.000Z,
      duration: 60,
      location: 'Briggs Field',
      description: 'Cheer on your favorite teams as they compete for the intramural championship! Food, prizes, and halftime mini-games included.',
      status: 'upcoming'
    },
    {
      _id: '019a617b-2394-7e75-9630-075fbf76d9a6',
      organizer: '019a0427-0b08-7b94-90ca-0c727c6f3a69',
      name: 'Book Swap',
      date: 2025-11-21T19:00:00.000Z,
      duration: 60,
      location: 'Hayden Library',
      description: 'Bring a book you’ve finished and exchange it for something new! A cozy event with light snacks, discussion tables, and a “blind date with a book” raffle.',
      status: 'upcoming'
    }
  ]
} => { request: '019a619f-3c63-7e7f-8732-12bff4fc8e88' }
[Requesting] Received request for path: /UserInterest/_getUsersInterestedInItems
[Requesting] Received request for path: /UserInterest/_getUsersInterestedInItems
[Requesting] Received request for path: /UserInterest/_getUsersInterestedInItems
[Requesting] Received request for path: /UserInterest/_getUsersInterestedInItems
Requesting.request {
  session: '019a619f-3172-7965-90cf-d26bbadd6658',
  item: '019a617b-2394-7e75-9630-075fbf76d9a6',
  path: '/UserInterest/_getUsersInterestedInItems'
} => { request: '019a619f-3f98-7432-93ce-8e8b0599959f' }
Requesting.request {
  session: '019a619f-3172-7965-90cf-d26bbadd6658',
  item: '019a617a-93cd-7ad2-8860-8ac6834fede0',
  path: '/UserInterest/_getUsersInterestedInItems'
} => { request: '019a619f-3f96-7894-b60c-e0306ff1eb01' }
Requesting.request {
  session: '019a619f-3172-7965-90cf-d26bbadd6658',
  item: '019a617a-0ab4-735f-b7c2-ccbdd38f234f',
  path: '/UserInterest/_getUsersInterestedInItems'
} => { request: '019a619f-3f97-741a-aa75-1f094f865a5c' }
Requesting.request {
  session: '019a619f-3172-7965-90cf-d26bbadd6658',
  item: '019a27b5-1b01-7c15-b048-4ca71e18431e',
  path: '/UserInterest/_getUsersInterestedInItems'
} => { request: '019a619f-3fa0-7cef-9b88-d0ba61c39a16' }
Requesting.respond { request: '019a619f-3f98-7432-93ce-8e8b0599959f', results: [] } => { request: '019a619f-3f98-7432-93ce-8e8b0599959f' }
Requesting.respond { request: '019a619f-3f97-741a-aa75-1f094f865a5c', results: [] } => { request: '019a619f-3f97-741a-aa75-1f094f865a5c' }
Requesting.respond {
  request: '019a619f-3f96-7894-b60c-e0306ff1eb01',
  results: [ { user: '019a0427-0b08-7b94-90ca-0c727c6f3a69' } ]
} => { request: '019a619f-3f96-7894-b60c-e0306ff1eb01' }
Requesting.respond {
  request: '019a619f-3fa0-7cef-9b88-d0ba61c39a16',
  results: [ { user: '019a0427-0b08-7b94-90ca-0c727c6f3a69' } ]
} => { request: '019a619f-3fa0-7cef-9b88-d0ba61c39a16' }
[Requesting] Received request for path: /UserInterest/_getItemInterests
Requesting.request {
  session: '019a619f-3172-7965-90cf-d26bbadd6658',
  path: '/UserInterest/_getItemInterests'
} => { request: '019a619f-41cf-7398-afc7-0020dc28bdc8' }
Requesting.respond {
  request: '019a619f-41cf-7398-afc7-0020dc28bdc8',
  results: [
    {
      _id: '019a09e1-3bba-73a0-9952-a7263d3b0c4e',
      user: '019a0427-0b08-7b94-90ca-0c727c6f3a69',
      item: '019a09c2-c849-7225-8763-f8fdfbe9108a'
    },
    {
      _id: '019a09e1-5d2c-7cba-b520-fc894dad5fb8',
      user: '019a0427-0b08-7b94-90ca-0c727c6f3a69',
      item: '019a09de-3772-7a24-8578-2c85fceeb008'
    },
    {
      _id: '019a0a06-bce0-7ad9-97b6-f875bb578438',
      user: '019a0427-0b08-7b94-90ca-0c727c6f3a69',
      item: '019a0a06-9f88-7846-aab4-69782ae9e5e2'
    },
    {
      _id: '019a0a1e-8bd8-7229-8039-00d7ccb7da37',
      user: '019a0427-0b08-7b94-90ca-0c727c6f3a69',
      item: '019a0a1e-7304-7d40-b744-3906f9412adb'
    },
    {
      _id: '019a2284-1e81-7269-94bd-0a468a05f2f4',
      user: '019a0427-0b08-7b94-90ca-0c727c6f3a69',
      item: '019a227d-06db-7fb3-9350-7b420562de68'
    },
    {
      _id: '019a271b-f74b-741c-a629-fbd34071da29',
      user: '019a0427-0b08-7b94-90ca-0c727c6f3a69',
      item: '019a2718-40a6-7b30-a403-a905f48338ef'
    },
    {
      _id: '019a2dec-af43-7f88-98a8-5285f6518fef',
      user: '019a0427-0b08-7b94-90ca-0c727c6f3a69',
      item: '019a27b1-724b-7741-ac95-ae204782cb2e'
    },
    {
      _id: '019a6155-3de4-71cd-b7da-12f8627a0dbf',
      user: '019a0427-0b08-7b94-90ca-0c727c6f3a69',
      item: '019a60ca-6cb4-7e20-85b5-ce13f0f8b227'
    },
    {
      _id: '019a619a-cc30-7431-a20c-16ac98c6b993',
      user: '019a0427-0b08-7b94-90ca-0c727c6f3a69',
      item: '019a27b5-1b01-7c15-b048-4ca71e18431e'
    },
    {
      _id: '019a619c-7247-7c47-abb7-f2600d867fc8',
      user: '019a0427-0b08-7b94-90ca-0c727c6f3a69',
      item: '019a617a-93cd-7ad2-8860-8ac6834fede0'
    }
  ]
} => { request: '019a619f-41cf-7398-afc7-0020dc28bdc8' }
[Requesting] Received request for path: /Event/_getEventById
Requesting.request {
  session: '019a619f-3172-7965-90cf-d26bbadd6658',
  event: '019a0a06-9f88-7846-aab4-69782ae9e5e2',
  path: '/Event/_getEventById'
} => { request: '019a619f-44ff-7af7-b772-1445b8bf3337' }
Requesting.respond {
  request: '019a619f-44ff-7af7-b772-1445b8bf3337',
  event: {
    _id: '019a0a06-9f88-7846-aab4-69782ae9e5e2',
    organizer: '019a0427-0b08-7b94-90ca-0c727c6f3a69',
    name: 'test',
    date: 2025-10-22T16:00:00.000Z,
    duration: 60,
    location: 'test',
    description: 'test...',
    status: 'completed'
  }
} => { request: '019a619f-44ff-7af7-b772-1445b8bf3337' }
[Requesting] Received request for path: /UserInterest/removeItemInterest
Requesting.request {
  session: '019a619f-3172-7965-90cf-d26bbadd6658',
  item: '019a27b5-1b01-7c15-b048-4ca71e18431e',
  path: '/UserInterest/removeItemInterest'
} => { request: '019a619f-97e2-7967-819d-56c1c945da13' }
UserInterest.removeItemInterest {
  user: '019a0427-0b08-7b94-90ca-0c727c6f3a69',
  item: '019a27b5-1b01-7c15-b048-4ca71e18431e'
} => {}
Requesting.respond { request: '019a619f-97e2-7967-819d-56c1c945da13', success: true } => { request: '019a619f-97e2-7967-819d-56c1c945da13' }
[Requesting] Received request for path: /UserInterest/_getUsersInterestedInItems
[Requesting] Received request for path: /UserInterest/_getUsersInterestedInItems
[Requesting] Received request for path: /UserInterest/_getUsersInterestedInItems
[Requesting] Received request for path: /UserInterest/_getUsersInterestedInItems
Requesting.request {
  session: '019a619f-3172-7965-90cf-d26bbadd6658',
  item: '019a617b-2394-7e75-9630-075fbf76d9a6',
  path: '/UserInterest/_getUsersInterestedInItems'
} => { request: '019a619f-9b0b-7cd3-bfd0-95136a3bf3ee' }
Requesting.request {
  session: '019a619f-3172-7965-90cf-d26bbadd6658',
  item: '019a617a-93cd-7ad2-8860-8ac6834fede0',
  path: '/UserInterest/_getUsersInterestedInItems'
} => { request: '019a619f-9b11-7ba0-8667-f6c623990c8b' }
Requesting.request {
  session: '019a619f-3172-7965-90cf-d26bbadd6658',
  item: '019a27b5-1b01-7c15-b048-4ca71e18431e',
  path: '/UserInterest/_getUsersInterestedInItems'
} => { request: '019a619f-9b18-71f4-b579-dc5bde2c95fe' }
Requesting.request {
  session: '019a619f-3172-7965-90cf-d26bbadd6658',
  item: '019a617a-0ab4-735f-b7c2-ccbdd38f234f',
  path: '/UserInterest/_getUsersInterestedInItems'
} => { request: '019a619f-9b20-73ea-a463-ce385e9759c5' }
Requesting.respond { request: '019a619f-9b0b-7cd3-bfd0-95136a3bf3ee', results: [] } => { request: '019a619f-9b0b-7cd3-bfd0-95136a3bf3ee' }
Requesting.respond {
  request: '019a619f-9b11-7ba0-8667-f6c623990c8b',
  results: [ { user: '019a0427-0b08-7b94-90ca-0c727c6f3a69' } ]
} => { request: '019a619f-9b11-7ba0-8667-f6c623990c8b' }
Requesting.respond { request: '019a619f-9b20-73ea-a463-ce385e9759c5', results: [] } => { request: '019a619f-9b20-73ea-a463-ce385e9759c5' }
Requesting.respond { request: '019a619f-9b18-71f4-b579-dc5bde2c95fe', results: [] } => { request: '019a619f-9b18-71f4-b579-dc5bde2c95fe' }
[Requesting] Received request for path: /UserInterest/addItemInterest
Requesting.request {
  session: '019a619f-3172-7965-90cf-d26bbadd6658',
  item: '019a617b-2394-7e75-9630-075fbf76d9a6',
  path: '/UserInterest/addItemInterest'
} => { request: '019a619f-a5e2-70b3-922f-141edb97a3ea' }
UserInterest.addItemInterest {
  user: '019a0427-0b08-7b94-90ca-0c727c6f3a69',
  item: '019a617b-2394-7e75-9630-075fbf76d9a6'
} => { itemInterest: '019a619f-a6ee-7e10-90c8-b4f5d35c41f7' }
Requesting.respond {
  request: '019a619f-a5e2-70b3-922f-141edb97a3ea',
  itemInterest: '019a619f-a6ee-7e10-90c8-b4f5d35c41f7'
} => { request: '019a619f-a5e2-70b3-922f-141edb97a3ea' }
[Requesting] Received request for path: /UserInterest/_getUsersInterestedInItems
[Requesting] Received request for path: /UserInterest/_getUsersInterestedInItems
[Requesting] Received request for path: /UserInterest/_getUsersInterestedInItems
[Requesting] Received request for path: /UserInterest/_getUsersInterestedInItems
Requesting.request {
  session: '019a619f-3172-7965-90cf-d26bbadd6658',
  item: '019a617a-93cd-7ad2-8860-8ac6834fede0',
  path: '/UserInterest/_getUsersInterestedInItems'
} => { request: '019a619f-a898-7290-afa0-9140ffb373b5' }
Requesting.request {
  session: '019a619f-3172-7965-90cf-d26bbadd6658',
  item: '019a27b5-1b01-7c15-b048-4ca71e18431e',
  path: '/UserInterest/_getUsersInterestedInItems'
} => { request: '019a619f-a894-72a3-b778-3dc073c08b01' }
Requesting.request {
  session: '019a619f-3172-7965-90cf-d26bbadd6658',
  item: '019a617a-0ab4-735f-b7c2-ccbdd38f234f',
  path: '/UserInterest/_getUsersInterestedInItems'
} => { request: '019a619f-a899-7d4e-ae8b-e69880cb7e72' }
Requesting.request {
  session: '019a619f-3172-7965-90cf-d26bbadd6658',
  item: '019a617b-2394-7e75-9630-075fbf76d9a6',
  path: '/UserInterest/_getUsersInterestedInItems'
} => { request: '019a619f-a89a-75e0-a2ba-ca492babb462' }
Requesting.respond {
  request: '019a619f-a898-7290-afa0-9140ffb373b5',
  results: [ { user: '019a0427-0b08-7b94-90ca-0c727c6f3a69' } ]
} => { request: '019a619f-a898-7290-afa0-9140ffb373b5' }
Requesting.respond { request: '019a619f-a899-7d4e-ae8b-e69880cb7e72', results: [] } => { request: '019a619f-a899-7d4e-ae8b-e69880cb7e72' }
Requesting.respond {
  request: '019a619f-a89a-75e0-a2ba-ca492babb462',
  results: [ { user: '019a0427-0b08-7b94-90ca-0c727c6f3a69' } ]
} => { request: '019a619f-a89a-75e0-a2ba-ca492babb462' }
Requesting.respond { request: '019a619f-a894-72a3-b778-3dc073c08b01', results: [] } => { request: '019a619f-a894-72a3-b778-3dc073c08b01' }
[Requesting] Received request for path: /UserInterest/_getItemInterests
Requesting.request {
  session: '019a619f-3172-7965-90cf-d26bbadd6658',
  path: '/UserInterest/_getItemInterests'
} => { request: '019a619f-cda4-781e-bb37-5528934f80de' }
Requesting.respond {
  request: '019a619f-cda4-781e-bb37-5528934f80de',
  results: [
    {
      _id: '019a09e1-3bba-73a0-9952-a7263d3b0c4e',
      user: '019a0427-0b08-7b94-90ca-0c727c6f3a69',
      item: '019a09c2-c849-7225-8763-f8fdfbe9108a'
    },
    {
      _id: '019a09e1-5d2c-7cba-b520-fc894dad5fb8',
      user: '019a0427-0b08-7b94-90ca-0c727c6f3a69',
      item: '019a09de-3772-7a24-8578-2c85fceeb008'
    },
    {
      _id: '019a0a06-bce0-7ad9-97b6-f875bb578438',
      user: '019a0427-0b08-7b94-90ca-0c727c6f3a69',
      item: '019a0a06-9f88-7846-aab4-69782ae9e5e2'
    },
    {
      _id: '019a0a1e-8bd8-7229-8039-00d7ccb7da37',
      user: '019a0427-0b08-7b94-90ca-0c727c6f3a69',
      item: '019a0a1e-7304-7d40-b744-3906f9412adb'
    },
    {
      _id: '019a2284-1e81-7269-94bd-0a468a05f2f4',
      user: '019a0427-0b08-7b94-90ca-0c727c6f3a69',
      item: '019a227d-06db-7fb3-9350-7b420562de68'
    },
    {
      _id: '019a271b-f74b-741c-a629-fbd34071da29',
      user: '019a0427-0b08-7b94-90ca-0c727c6f3a69',
      item: '019a2718-40a6-7b30-a403-a905f48338ef'
    },
    {
      _id: '019a2dec-af43-7f88-98a8-5285f6518fef',
      user: '019a0427-0b08-7b94-90ca-0c727c6f3a69',
      item: '019a27b1-724b-7741-ac95-ae204782cb2e'
    },
    {
      _id: '019a6155-3de4-71cd-b7da-12f8627a0dbf',
      user: '019a0427-0b08-7b94-90ca-0c727c6f3a69',
      item: '019a60ca-6cb4-7e20-85b5-ce13f0f8b227'
    },
    {
      _id: '019a619c-7247-7c47-abb7-f2600d867fc8',
      user: '019a0427-0b08-7b94-90ca-0c727c6f3a69',
      item: '019a617a-93cd-7ad2-8860-8ac6834fede0'
    },
    {
      _id: '019a619f-a6ee-7e10-90c8-b4f5d35c41f7',
      user: '019a0427-0b08-7b94-90ca-0c727c6f3a69',
      item: '019a617b-2394-7e75-9630-075fbf76d9a6'
    }
  ]
} => { request: '019a619f-cda4-781e-bb37-5528934f80de' }
[Requesting] Received request for path: /Event/_getEventById
[Requesting] Received request for path: /Event/_getEventById
[Requesting] Received request for path: /Event/_getEventById
[Requesting] Received request for path: /Event/_getEventById
[Requesting] Received request for path: /Event/_getEventById
[Requesting] Received request for path: /Event/_getEventById
[Requesting] Received request for path: /Event/_getEventById
[Requesting] Received request for path: /Event/_getEventById
[Requesting] Received request for path: /Event/_getEventById
[Requesting] Received request for path: /Event/_getEventById
Requesting.request {
  session: '019a619f-3172-7965-90cf-d26bbadd6658',
  event: '019a0a06-9f88-7846-aab4-69782ae9e5e2',
  path: '/Event/_getEventById'
} => { request: '019a619f-cfc2-7bf5-8c9f-88c9aad0effe' }
Requesting.request {
  session: '019a619f-3172-7965-90cf-d26bbadd6658',
  event: '019a227d-06db-7fb3-9350-7b420562de68',
  path: '/Event/_getEventById'
} => { request: '019a619f-cfd0-7168-ac83-e0bc5069fcd3' }
Requesting.request {
  session: '019a619f-3172-7965-90cf-d26bbadd6658',
  event: '019a27b1-724b-7741-ac95-ae204782cb2e',
  path: '/Event/_getEventById'
} => { request: '019a619f-cfcd-72cf-9a75-fb49dbb55acd' }
Requesting.request {
  session: '019a619f-3172-7965-90cf-d26bbadd6658',
  event: '019a09de-3772-7a24-8578-2c85fceeb008',
  path: '/Event/_getEventById'
} => { request: '019a619f-cfd1-764c-b4f8-cf064d3a8577' }
Requesting.request {
  session: '019a619f-3172-7965-90cf-d26bbadd6658',
  event: '019a617a-93cd-7ad2-8860-8ac6834fede0',
  path: '/Event/_getEventById'
} => { request: '019a619f-cfce-7a8c-9dfd-148c54b337bc' }
Requesting.request {
  session: '019a619f-3172-7965-90cf-d26bbadd6658',
  event: '019a09c2-c849-7225-8763-f8fdfbe9108a',
  path: '/Event/_getEventById'
} => { request: '019a619f-cfd3-7ac9-9921-0aebb204ff82' }
Requesting.request {
  session: '019a619f-3172-7965-90cf-d26bbadd6658',
  event: '019a60ca-6cb4-7e20-85b5-ce13f0f8b227',
  path: '/Event/_getEventById'
} => { request: '019a619f-cfd6-77f8-8ac4-d8552351f9ac' }
Requesting.request {
  session: '019a619f-3172-7965-90cf-d26bbadd6658',
  event: '019a2718-40a6-7b30-a403-a905f48338ef',
  path: '/Event/_getEventById'
} => { request: '019a619f-cfd9-7884-bcb0-7fe048333476' }
Requesting.request {
  session: '019a619f-3172-7965-90cf-d26bbadd6658',
  event: '019a617b-2394-7e75-9630-075fbf76d9a6',
  path: '/Event/_getEventById'
} => { request: '019a619f-cfe7-72d8-a102-eddca4e14227' }
Requesting.request {
  session: '019a619f-3172-7965-90cf-d26bbadd6658',
  event: '019a0a1e-7304-7d40-b744-3906f9412adb',
  path: '/Event/_getEventById'
} => { request: '019a619f-cfe8-7f5e-ade7-ee20cfbe72af' }
Requesting.respond {
  request: '019a619f-cfc2-7bf5-8c9f-88c9aad0effe',
  event: {
    _id: '019a0a06-9f88-7846-aab4-69782ae9e5e2',
    organizer: '019a0427-0b08-7b94-90ca-0c727c6f3a69',
    name: 'test',
    date: 2025-10-22T16:00:00.000Z,
    duration: 60,
    location: 'test',
    description: 'test...',
    status: 'completed'
  }
} => { request: '019a619f-cfc2-7bf5-8c9f-88c9aad0effe' }
Requesting.respond { request: '019a619f-cfd0-7168-ac83-e0bc5069fcd3', event: null } => { request: '019a619f-cfd0-7168-ac83-e0bc5069fcd3' }
Requesting.respond {
  request: '019a619f-cfcd-72cf-9a75-fb49dbb55acd',
  event: {
    _id: '019a27b1-724b-7741-ac95-ae204782cb2e',
    organizer: '019a0427-0b08-7b94-90ca-0c727c6f3a69',
    name: 'Boston Fall Food Festival',
    date: 2025-11-01T16:00:00.000Z,
    duration: 180,
    location: 'Boston',
    description: 'Sample dishes from over 50 local restaurants and food trucks celebrating seasonal flavors.',
    status: 'completed'
  }
} => { request: '019a619f-cfcd-72cf-9a75-fb49dbb55acd' }
Requesting.respond { request: '019a619f-cfd1-764c-b4f8-cf064d3a8577', event: null } => { request: '019a619f-cfd1-764c-b4f8-cf064d3a8577' }
Requesting.respond {
  request: '019a619f-cfce-7a8c-9dfd-148c54b337bc',
  event: {
    _id: '019a617a-93cd-7ad2-8860-8ac6834fede0',
    organizer: '019a0427-0b08-7b94-90ca-0c727c6f3a69',
    name: 'Intramural Soccer Finals',
    date: 2025-11-18T00:00:00.000Z,
    duration: 60,
    location: 'Briggs Field',
    description: 'Cheer on your favorite teams as they compete for the intramural championship! Food, prizes, and halftime mini-games included.',
    status: 'upcoming'
  }
} => { request: '019a619f-cfce-7a8c-9dfd-148c54b337bc' }
Requesting.respond { request: '019a619f-cfd3-7ac9-9921-0aebb204ff82', event: null } => { request: '019a619f-cfd3-7ac9-9921-0aebb204ff82' }
Requesting.respond {
  request: '019a619f-cfd9-7884-bcb0-7fe048333476',
  event: {
    _id: '019a2718-40a6-7b30-a403-a905f48338ef',
    organizer: '019a2702-adbc-75ba-931c-c0e72cf707b5',
    name: 'new',
    date: 2025-10-27T21:00:00.000Z,
    duration: 60,
    location: 'test',
    description: 'TEST',
    status: 'completed'
  }
} => { request: '019a619f-cfd9-7884-bcb0-7fe048333476' }
Requesting.respond {
  request: '019a619f-cfd6-77f8-8ac4-d8552351f9ac',
  event: {
    _id: '019a60ca-6cb4-7e20-85b5-ce13f0f8b227',
    organizer: '019a0427-0b08-7b94-90ca-0c727c6f3a69',
    name: 'The Fourth Witch',
    date: 2025-11-08T01:00:00.000Z,
    duration: 120,
    location: 'Paramount Theater',
    description: 'A Macbeth-based play involving a puppet show.',
    status: 'completed'
  }
} => { request: '019a619f-cfd6-77f8-8ac4-d8552351f9ac' }
Requesting.respond {
  request: '019a619f-cfe7-72d8-a102-eddca4e14227',
  event: {
    _id: '019a617b-2394-7e75-9630-075fbf76d9a6',
    organizer: '019a0427-0b08-7b94-90ca-0c727c6f3a69',
    name: 'Book Swap',
    date: 2025-11-21T19:00:00.000Z,
    duration: 60,
    location: 'Hayden Library',
    description: 'Bring a book you’ve finished and exchange it for something new! A cozy event with light snacks, discussion tables, and a “blind date with a book” raffle.',
    status: 'upcoming'
  }
} => { request: '019a619f-cfe7-72d8-a102-eddca4e14227' }
Requesting.respond {
  request: '019a619f-cfe8-7f5e-ade7-ee20cfbe72af',
  event: {
    _id: '019a0a1e-7304-7d40-b744-3906f9412adb',
    organizer: '019a0427-0b08-7b94-90ca-0c727c6f3a69',
    name: 'testing_history',
    date: 2025-10-22T04:13:00.000Z,
    duration: 1,
    location: 'test',
    description: 'test',
    status: 'completed'
  }
} => { request: '019a619f-cfe8-7f5e-ade7-ee20cfbe72af' }
[Requesting] Received request for path: /Event/_getEventsByOrganizer
Requesting.request {
  session: '019a619f-3172-7965-90cf-d26bbadd6658',
  organizer: '019a0427-0b08-7b94-90ca-0c727c6f3a69',
  path: '/Event/_getEventsByOrganizer'
} => { request: '019a61a0-3583-7d1b-a8e9-b30829fc0f5f' }
Requesting.respond {
  request: '019a61a0-3583-7d1b-a8e9-b30829fc0f5f',
  results: [
    {
      _id: '019a09f9-0d35-7dfa-8056-c8b33dac8f36',
      organizer: '019a0427-0b08-7b94-90ca-0c727c6f3a69',
      name: 'Study Break',
      date: 2025-10-22T03:32:00.000Z,
      duration: 1,
      location: 'Burton-Conner',
      description: 'Take a break from studying and eat snacks!',
      status: 'completed'
    },
    {
      _id: '019a0a06-9f88-7846-aab4-69782ae9e5e2',
      organizer: '019a0427-0b08-7b94-90ca-0c727c6f3a69',
      name: 'test',
      date: 2025-10-22T16:00:00.000Z,
      duration: 60,
      location: 'test',
      description: 'test...',
      status: 'completed'
    },
    {
      _id: '019a0a1e-7304-7d40-b744-3906f9412adb',
      organizer: '019a0427-0b08-7b94-90ca-0c727c6f3a69',
      name: 'testing_history',
      date: 2025-10-22T04:13:00.000Z,
      duration: 1,
      location: 'test',
      description: 'test',
      status: 'completed'
    },
    {
      _id: '019a27b1-724b-7741-ac95-ae204782cb2e',
      organizer: '019a0427-0b08-7b94-90ca-0c727c6f3a69',
      name: 'Boston Fall Food Festival',
      date: 2025-11-01T16:00:00.000Z,
      duration: 180,
      location: 'Boston',
      description: 'Sample dishes from over 50 local restaurants and food trucks celebrating seasonal flavors.',
      status: 'completed'
    },
    {
      _id: '019a27b2-388d-7639-b14d-c251b555ca81',
      organizer: '019a0427-0b08-7b94-90ca-0c727c6f3a69',
      name: 'Sunset Yoga by the Charles',
      date: 2025-11-01T21:00:00.000Z,
      duration: 60,
      location: 'Esplanade Park, Boston, MA',
      description: 'A calming yoga session at sunset for all levels, hosted by local instructors.',
      status: 'completed'
    },
    {
      _id: '019a27b2-e903-701f-80f7-c69986f559ca',
      organizer: '019a0427-0b08-7b94-90ca-0c727c6f3a69',
      name: 'Intro to Digital Illustration',
      date: 2025-11-02T00:00:00.000Z,
      duration: 60,
      location: 'Boston Center for the Arts',
      description: 'A beginner-friendly workshop introducing techniques in digital drawing using Procreate.',
      status: 'completed'
    },
    {
      _id: '019a27b3-7141-75c7-8e2b-9a27f1db7e8d',
      organizer: '019a0427-0b08-7b94-90ca-0c727c6f3a69',
      name: 'Climate Change Policy Panel',
      date: 2025-11-03T22:00:00.000Z,
      duration: 60,
      location: 'Harvard Kennedy School, Cambridge, MA',
      description: 'Experts discuss actionable policy solutions to mitigate climate change.',
      status: 'completed'
    },
    {
      _id: '019a27b4-1b28-7804-a4cb-4630f02ff044',
      organizer: '019a0427-0b08-7b94-90ca-0c727c6f3a69',
      name: 'Film Screening: Future Cities',
      date: 2025-11-07T01:30:00.000Z,
      duration: 60,
      location: 'Coolidge Corner Theatre, Brookline, MA',
      description: 'A documentary exploring the technology shaping the sustainable cities of tomorrow.',
      status: 'completed'
    },
    {
      _id: '019a27b5-1b01-7c15-b048-4ca71e18431e',
      organizer: '019a0427-0b08-7b94-90ca-0c727c6f3a69',
      name: 'Women in Tech Networking Night',
      date: 2025-11-15T23:00:00.000Z,
      duration: 60,
      location: 'HubSpot HQ, Cambridge, MA',
      description: 'An evening to connect women and nonbinary professionals in the Boston tech scene.',
      status: 'upcoming'
    },
    {
      _id: '019a60ca-6cb4-7e20-85b5-ce13f0f8b227',
      organizer: '019a0427-0b08-7b94-90ca-0c727c6f3a69',
      name: 'The Fourth Witch',
      date: 2025-11-08T01:00:00.000Z,
      duration: 120,
      location: 'Paramount Theater',
      description: 'A Macbeth-based play involving a puppet show.',
      status: 'completed'
    },
    {
      _id: '019a617a-0ab4-735f-b7c2-ccbdd38f234f',
      organizer: '019a0427-0b08-7b94-90ca-0c727c6f3a69',
      name: 'Late Night Study Break',
      date: 2025-11-12T22:00:00.000Z,
      duration: 60,
      location: 'Student Center',
      description: 'Take a break from midterms! Stop by the student center for free pizza, games, and trivia. Open to all undergrads — bring your friends and de-stress before exams.',
      status: 'upcoming'
    },
    {
      _id: '019a617a-93cd-7ad2-8860-8ac6834fede0',
      organizer: '019a0427-0b08-7b94-90ca-0c727c6f3a69',
      name: 'Intramural Soccer Finals',
      date: 2025-11-18T00:00:00.000Z,
      duration: 60,
      location: 'Briggs Field',
      description: 'Cheer on your favorite teams as they compete for the intramural championship! Food, prizes, and halftime mini-games included.',
      status: 'upcoming'
    },
    {
      _id: '019a617b-2394-7e75-9630-075fbf76d9a6',
      organizer: '019a0427-0b08-7b94-90ca-0c727c6f3a69',
      name: 'Book Swap',
      date: 2025-11-21T19:00:00.000Z,
      duration: 60,
      location: 'Hayden Library',
      description: 'Bring a book you’ve finished and exchange it for something new! A cozy event with light snacks, discussion tables, and a “blind date with a book” raffle.',
      status: 'upcoming'
    }
  ]
} => { request: '019a61a0-3583-7d1b-a8e9-b30829fc0f5f' }
[Requesting] Received request for path: /UserInterest/_getUsersInterestedInItems
[Requesting] Received request for path: /UserInterest/_getUsersInterestedInItems
[Requesting] Received request for path: /UserInterest/_getUsersInterestedInItems
[Requesting] Received request for path: /UserInterest/_getUsersInterestedInItems
[Requesting] Received request for path: /UserInterest/_getUsersInterestedInItems
[Requesting] Received request for path: /UserInterest/_getUsersInterestedInItems
[Requesting] Received request for path: /UserInterest/_getUsersInterestedInItems
[Requesting] Received request for path: /UserInterest/_getUsersInterestedInItems
[Requesting] Received request for path: /UserInterest/_getUsersInterestedInItems
[Requesting] Received request for path: /UserInterest/_getUsersInterestedInItems
[Requesting] Received request for path: /UserInterest/_getUsersInterestedInItems
[Requesting] Received request for path: /UserInterest/_getUsersInterestedInItems
Requesting.request {
  session: '019a619f-3172-7965-90cf-d26bbadd6658',
  item: '019a617a-93cd-7ad2-8860-8ac6834fede0',
  path: '/UserInterest/_getUsersInterestedInItems'
} => { request: '019a61a0-38b0-711d-bea0-69f7be1651d9' }
Requesting.request {
  session: '019a619f-3172-7965-90cf-d26bbadd6658',
  item: '019a0a1e-7304-7d40-b744-3906f9412adb',
  path: '/UserInterest/_getUsersInterestedInItems'
} => { request: '019a61a0-38b1-7bb2-8fb3-3720e140cddc' }
Requesting.request {
  session: '019a619f-3172-7965-90cf-d26bbadd6658',
  item: '019a27b3-7141-75c7-8e2b-9a27f1db7e8d',
  path: '/UserInterest/_getUsersInterestedInItems'
} => { request: '019a61a0-38b4-75ba-b3c3-e2e656809503' }
Requesting.request {
  session: '019a619f-3172-7965-90cf-d26bbadd6658',
  item: '019a27b4-1b28-7804-a4cb-4630f02ff044',
  path: '/UserInterest/_getUsersInterestedInItems'
} => { request: '019a61a0-38b6-7b33-a4bc-98bef2c40c3c' }
Requesting.request {
  session: '019a619f-3172-7965-90cf-d26bbadd6658',
  item: '019a0a06-9f88-7846-aab4-69782ae9e5e2',
  path: '/UserInterest/_getUsersInterestedInItems'
} => { request: '019a61a0-38b7-7fce-9a4c-86968f933dc5' }
Requesting.request {
  session: '019a619f-3172-7965-90cf-d26bbadd6658',
  item: '019a27b5-1b01-7c15-b048-4ca71e18431e',
  path: '/UserInterest/_getUsersInterestedInItems'
} => { request: '019a61a0-38b8-7771-a525-69ce9c7c92d1' }
Requesting.request {
  session: '019a619f-3172-7965-90cf-d26bbadd6658',
  item: '019a27b1-724b-7741-ac95-ae204782cb2e',
  path: '/UserInterest/_getUsersInterestedInItems'
} => { request: '019a61a0-38b9-7eb2-9b56-4630aa46178d' }
Requesting.request {
  session: '019a619f-3172-7965-90cf-d26bbadd6658',
  item: '019a27b2-388d-7639-b14d-c251b555ca81',
  path: '/UserInterest/_getUsersInterestedInItems'
} => { request: '019a61a0-38be-718c-b355-eb3071a4e567' }
Requesting.request {
  session: '019a619f-3172-7965-90cf-d26bbadd6658',
  item: '019a09f9-0d35-7dfa-8056-c8b33dac8f36',
  path: '/UserInterest/_getUsersInterestedInItems'
} => { request: '019a61a0-38c0-7632-8513-8af97a40e2d6' }
Requesting.request {
  session: '019a619f-3172-7965-90cf-d26bbadd6658',
  item: '019a27b2-e903-701f-80f7-c69986f559ca',
  path: '/UserInterest/_getUsersInterestedInItems'
} => { request: '019a61a0-38bb-7580-92e7-5b32a54b1e54' }
Requesting.request {
  session: '019a619f-3172-7965-90cf-d26bbadd6658',
  item: '019a60ca-6cb4-7e20-85b5-ce13f0f8b227',
  path: '/UserInterest/_getUsersInterestedInItems'
} => { request: '019a61a0-38c2-7624-a3fd-4e6ff83fca86' }
[Requesting] Received request for path: /UserInterest/_getUsersInterestedInItems
Requesting.respond {
  request: '019a61a0-38b0-711d-bea0-69f7be1651d9',
  results: [ { user: '019a0427-0b08-7b94-90ca-0c727c6f3a69' } ]
} => { request: '019a61a0-38b0-711d-bea0-69f7be1651d9' }
Requesting.respond {
  request: '019a61a0-38b1-7bb2-8fb3-3720e140cddc',
  results: [ { user: '019a0427-0b08-7b94-90ca-0c727c6f3a69' } ]
} => { request: '019a61a0-38b1-7bb2-8fb3-3720e140cddc' }
Requesting.respond { request: '019a61a0-38b8-7771-a525-69ce9c7c92d1', results: [] } => { request: '019a61a0-38b8-7771-a525-69ce9c7c92d1' }
Requesting.respond { request: '019a61a0-38c0-7632-8513-8af97a40e2d6', results: [] } => { request: '019a61a0-38c0-7632-8513-8af97a40e2d6' }
Requesting.respond { request: '019a61a0-38be-718c-b355-eb3071a4e567', results: [] } => { request: '019a61a0-38be-718c-b355-eb3071a4e567' }
Requesting.respond { request: '019a61a0-38b6-7b33-a4bc-98bef2c40c3c', results: [] } => { request: '019a61a0-38b6-7b33-a4bc-98bef2c40c3c' }
Requesting.respond {
  request: '019a61a0-38b9-7eb2-9b56-4630aa46178d',
  results: [
    { user: '019a2702-adbc-75ba-931c-c0e72cf707b5' },
    { user: '019a0427-0b08-7b94-90ca-0c727c6f3a69' }
  ]
} => { request: '019a61a0-38b9-7eb2-9b56-4630aa46178d' }
Requesting.respond {
  request: '019a61a0-38b7-7fce-9a4c-86968f933dc5',
  results: [ { user: '019a0427-0b08-7b94-90ca-0c727c6f3a69' } ]
} => { request: '019a61a0-38b7-7fce-9a4c-86968f933dc5' }
Requesting.respond { request: '019a61a0-38b4-75ba-b3c3-e2e656809503', results: [] } => { request: '019a61a0-38b4-75ba-b3c3-e2e656809503' }
Requesting.respond { request: '019a61a0-38bb-7580-92e7-5b32a54b1e54', results: [] } => { request: '019a61a0-38bb-7580-92e7-5b32a54b1e54' }
Requesting.respond {
  request: '019a61a0-38c2-7624-a3fd-4e6ff83fca86',
  results: [ { user: '019a0427-0b08-7b94-90ca-0c727c6f3a69' } ]
} => { request: '019a61a0-38c2-7624-a3fd-4e6ff83fca86' }
Requesting.request {
  session: '019a619f-3172-7965-90cf-d26bbadd6658',
  item: '019a617b-2394-7e75-9630-075fbf76d9a6',
  path: '/UserInterest/_getUsersInterestedInItems'
} => { request: '019a61a0-38c5-7e2c-8bdc-2a90d55c41cd' }
Requesting.request {
  session: '019a619f-3172-7965-90cf-d26bbadd6658',
  item: '019a617a-0ab4-735f-b7c2-ccbdd38f234f',
  path: '/UserInterest/_getUsersInterestedInItems'
} => { request: '019a61a0-3990-779c-9760-c48d3c4ad609' }
Requesting.respond {
  request: '019a61a0-38c5-7e2c-8bdc-2a90d55c41cd',
  results: [ { user: '019a0427-0b08-7b94-90ca-0c727c6f3a69' } ]
} => { request: '019a61a0-38c5-7e2c-8bdc-2a90d55c41cd' }
Requesting.respond { request: '019a61a0-3990-779c-9760-c48d3c4ad609', results: [] } => { request: '019a61a0-3990-779c-9760-c48d3c4ad609' }
[Requesting] Received request for path: /UserInterest/_getItemInterests
Requesting.request {
  session: '019a619f-3172-7965-90cf-d26bbadd6658',
  path: '/UserInterest/_getItemInterests'
} => { request: '019a61a0-3db5-7cbc-8ec0-edeebe721048' }
Requesting.respond {
  request: '019a61a0-3db5-7cbc-8ec0-edeebe721048',
  results: [
    {
      _id: '019a09e1-3bba-73a0-9952-a7263d3b0c4e',
      user: '019a0427-0b08-7b94-90ca-0c727c6f3a69',
      item: '019a09c2-c849-7225-8763-f8fdfbe9108a'
    },
    {
      _id: '019a09e1-5d2c-7cba-b520-fc894dad5fb8',
      user: '019a0427-0b08-7b94-90ca-0c727c6f3a69',
      item: '019a09de-3772-7a24-8578-2c85fceeb008'
    },
    {
      _id: '019a0a06-bce0-7ad9-97b6-f875bb578438',
      user: '019a0427-0b08-7b94-90ca-0c727c6f3a69',
      item: '019a0a06-9f88-7846-aab4-69782ae9e5e2'
    },
    {
      _id: '019a0a1e-8bd8-7229-8039-00d7ccb7da37',
      user: '019a0427-0b08-7b94-90ca-0c727c6f3a69',
      item: '019a0a1e-7304-7d40-b744-3906f9412adb'
    },
    {
      _id: '019a2284-1e81-7269-94bd-0a468a05f2f4',
      user: '019a0427-0b08-7b94-90ca-0c727c6f3a69',
      item: '019a227d-06db-7fb3-9350-7b420562de68'
    },
    {
      _id: '019a271b-f74b-741c-a629-fbd34071da29',
      user: '019a0427-0b08-7b94-90ca-0c727c6f3a69',
      item: '019a2718-40a6-7b30-a403-a905f48338ef'
    },
    {
      _id: '019a2dec-af43-7f88-98a8-5285f6518fef',
      user: '019a0427-0b08-7b94-90ca-0c727c6f3a69',
      item: '019a27b1-724b-7741-ac95-ae204782cb2e'
    },
    {
      _id: '019a6155-3de4-71cd-b7da-12f8627a0dbf',
      user: '019a0427-0b08-7b94-90ca-0c727c6f3a69',
      item: '019a60ca-6cb4-7e20-85b5-ce13f0f8b227'
    },
    {
      _id: '019a619c-7247-7c47-abb7-f2600d867fc8',
      user: '019a0427-0b08-7b94-90ca-0c727c6f3a69',
      item: '019a617a-93cd-7ad2-8860-8ac6834fede0'
    },
    {
      _id: '019a619f-a6ee-7e10-90c8-b4f5d35c41f7',
      user: '019a0427-0b08-7b94-90ca-0c727c6f3a69',
      item: '019a617b-2394-7e75-9630-075fbf76d9a6'
    }
  ]
} => { request: '019a61a0-3db5-7cbc-8ec0-edeebe721048' }
[Requesting] Received request for path: /Event/_getEventById
[Requesting] Received request for path: /Event/_getEventById
[Requesting] Received request for path: /Event/_getEventById
[Requesting] Received request for path: /Event/_getEventById
[Requesting] Received request for path: /Event/_getEventById
[Requesting] Received request for path: /Event/_getEventById
[Requesting] Received request for path: /Event/_getEventById
[Requesting] Received request for path: /Event/_getEventById
[Requesting] Received request for path: /Event/_getEventById
Requesting.request {
  session: '019a619f-3172-7965-90cf-d26bbadd6658',
  event: '019a27b1-724b-7741-ac95-ae204782cb2e',
  path: '/Event/_getEventById'
} => { request: '019a61a0-3fc4-70ca-a5df-29448b60e263' }
Requesting.request {
  session: '019a619f-3172-7965-90cf-d26bbadd6658',
  event: '019a0a06-9f88-7846-aab4-69782ae9e5e2',
  path: '/Event/_getEventById'
} => { request: '019a61a0-3fc3-7cbd-a888-2a306f619591' }
Requesting.request {
  session: '019a619f-3172-7965-90cf-d26bbadd6658',
  event: '019a09c2-c849-7225-8763-f8fdfbe9108a',
  path: '/Event/_getEventById'
} => { request: '019a61a0-3fc8-7f23-895f-65a13f63cc06' }
[Requesting] Received request for path: /Event/_getEventById
Requesting.request {
  session: '019a619f-3172-7965-90cf-d26bbadd6658',
  event: '019a60ca-6cb4-7e20-85b5-ce13f0f8b227',
  path: '/Event/_getEventById'
} => { request: '019a61a0-3fcd-7e41-b54b-fd4d7f433237' }
Requesting.request {
  session: '019a619f-3172-7965-90cf-d26bbadd6658',
  event: '019a0a1e-7304-7d40-b744-3906f9412adb',
  path: '/Event/_getEventById'
} => { request: '019a61a0-3fce-758e-851b-c2de96b165ef' }
Requesting.request {
  session: '019a619f-3172-7965-90cf-d26bbadd6658',
  event: '019a2718-40a6-7b30-a403-a905f48338ef',
  path: '/Event/_getEventById'
} => { request: '019a61a0-3fce-74a3-8f62-bfb86f4586d5' }
Requesting.request {
  session: '019a619f-3172-7965-90cf-d26bbadd6658',
  event: '019a617b-2394-7e75-9630-075fbf76d9a6',
  path: '/Event/_getEventById'
} => { request: '019a61a0-3fd3-7d78-b56b-197f1f503c34' }
Requesting.request {
  session: '019a619f-3172-7965-90cf-d26bbadd6658',
  event: '019a617a-93cd-7ad2-8860-8ac6834fede0',
  path: '/Event/_getEventById'
} => { request: '019a61a0-3fd4-78de-8cd7-fc38af37200f' }
Requesting.request {
  session: '019a619f-3172-7965-90cf-d26bbadd6658',
  event: '019a227d-06db-7fb3-9350-7b420562de68',
  path: '/Event/_getEventById'
} => { request: '019a61a0-3fe2-7a47-ab3b-041890fcffe8' }
Requesting.request {
  session: '019a619f-3172-7965-90cf-d26bbadd6658',
  event: '019a09de-3772-7a24-8578-2c85fceeb008',
  path: '/Event/_getEventById'
} => { request: '019a61a0-400d-7633-8fca-8b210c3debb0' }
Requesting.respond {
  request: '019a61a0-3fc4-70ca-a5df-29448b60e263',
  event: {
    _id: '019a27b1-724b-7741-ac95-ae204782cb2e',
    organizer: '019a0427-0b08-7b94-90ca-0c727c6f3a69',
    name: 'Boston Fall Food Festival',
    date: 2025-11-01T16:00:00.000Z,
    duration: 180,
    location: 'Boston',
    description: 'Sample dishes from over 50 local restaurants and food trucks celebrating seasonal flavors.',
    status: 'completed'
  }
} => { request: '019a61a0-3fc4-70ca-a5df-29448b60e263' }
Requesting.respond {
  request: '019a61a0-3fc3-7cbd-a888-2a306f619591',
  event: {
    _id: '019a0a06-9f88-7846-aab4-69782ae9e5e2',
    organizer: '019a0427-0b08-7b94-90ca-0c727c6f3a69',
    name: 'test',
    date: 2025-10-22T16:00:00.000Z,
    duration: 60,
    location: 'test',
    description: 'test...',
    status: 'completed'
  }
} => { request: '019a61a0-3fc3-7cbd-a888-2a306f619591' }
Requesting.respond { request: '019a61a0-3fe2-7a47-ab3b-041890fcffe8', event: null } => { request: '019a61a0-3fe2-7a47-ab3b-041890fcffe8' }
Requesting.respond {
  request: '019a61a0-3fcd-7e41-b54b-fd4d7f433237',
  event: {
    _id: '019a60ca-6cb4-7e20-85b5-ce13f0f8b227',
    organizer: '019a0427-0b08-7b94-90ca-0c727c6f3a69',
    name: 'The Fourth Witch',
    date: 2025-11-08T01:00:00.000Z,
    duration: 120,
    location: 'Paramount Theater',
    description: 'A Macbeth-based play involving a puppet show.',
    status: 'completed'
  }
} => { request: '019a61a0-3fcd-7e41-b54b-fd4d7f433237' }
Requesting.respond { request: '019a61a0-3fc8-7f23-895f-65a13f63cc06', event: null } => { request: '019a61a0-3fc8-7f23-895f-65a13f63cc06' }
Requesting.respond {
  request: '019a61a0-3fce-74a3-8f62-bfb86f4586d5',
  event: {
    _id: '019a2718-40a6-7b30-a403-a905f48338ef',
    organizer: '019a2702-adbc-75ba-931c-c0e72cf707b5',
    name: 'new',
    date: 2025-10-27T21:00:00.000Z,
    duration: 60,
    location: 'test',
    description: 'TEST',
    status: 'completed'
  }
} => { request: '019a61a0-3fce-74a3-8f62-bfb86f4586d5' }
Requesting.respond {
  request: '019a61a0-3fd4-78de-8cd7-fc38af37200f',
  event: {
    _id: '019a617a-93cd-7ad2-8860-8ac6834fede0',
    organizer: '019a0427-0b08-7b94-90ca-0c727c6f3a69',
    name: 'Intramural Soccer Finals',
    date: 2025-11-18T00:00:00.000Z,
    duration: 60,
    location: 'Briggs Field',
    description: 'Cheer on your favorite teams as they compete for the intramural championship! Food, prizes, and halftime mini-games included.',
    status: 'upcoming'
  }
} => { request: '019a61a0-3fd4-78de-8cd7-fc38af37200f' }
Requesting.respond {
  request: '019a61a0-3fce-758e-851b-c2de96b165ef',
  event: {
    _id: '019a0a1e-7304-7d40-b744-3906f9412adb',
    organizer: '019a0427-0b08-7b94-90ca-0c727c6f3a69',
    name: 'testing_history',
    date: 2025-10-22T04:13:00.000Z,
    duration: 1,
    location: 'test',
    description: 'test',
    status: 'completed'
  }
} => { request: '019a61a0-3fce-758e-851b-c2de96b165ef' }
Requesting.respond {
  request: '019a61a0-3fd3-7d78-b56b-197f1f503c34',
  event: {
    _id: '019a617b-2394-7e75-9630-075fbf76d9a6',
    organizer: '019a0427-0b08-7b94-90ca-0c727c6f3a69',
    name: 'Book Swap',
    date: 2025-11-21T19:00:00.000Z,
    duration: 60,
    location: 'Hayden Library',
    description: 'Bring a book you’ve finished and exchange it for something new! A cozy event with light snacks, discussion tables, and a “blind date with a book” raffle.',
    status: 'upcoming'
  }
} => { request: '019a61a0-3fd3-7d78-b56b-197f1f503c34' }
Requesting.respond { request: '019a61a0-400d-7633-8fca-8b210c3debb0', event: null } => { request: '019a61a0-400d-7633-8fca-8b210c3debb0' }
[Requesting] Received request for path: /UserInterest/removeItemInterest
Requesting.request {
  session: '019a619f-3172-7965-90cf-d26bbadd6658',
  item: '019a617a-93cd-7ad2-8860-8ac6834fede0',
  path: '/UserInterest/removeItemInterest'
} => { request: '019a61a0-f363-7c76-a7b5-6652aa95240a' }
UserInterest.removeItemInterest {
  user: '019a0427-0b08-7b94-90ca-0c727c6f3a69',
  item: '019a617a-93cd-7ad2-8860-8ac6834fede0'
} => {}
Requesting.respond { request: '019a61a0-f363-7c76-a7b5-6652aa95240a', success: true } => { request: '019a61a0-f363-7c76-a7b5-6652aa95240a' }
[Requesting] Received request for path: /UserInterest/_getPersonalInterests
Requesting.request {
  session: '019a619f-3172-7965-90cf-d26bbadd6658',
  path: '/UserInterest/_getPersonalInterests'
} => { request: '019a61a0-f67c-7a5a-aff3-d5ab226fe29b' }
Requesting.respond {
  request: '019a61a0-f67c-7a5a-aff3-d5ab226fe29b',
  results: [
    {
      _id: '019a2876-479f-7587-a931-2863c4c428c5',
      user: '019a0427-0b08-7b94-90ca-0c727c6f3a69',
      tag: 'Recycling'
    },
    {
      _id: '019a60af-d8b6-71cb-bca4-86426e4fc7b3',
      user: '019a0427-0b08-7b94-90ca-0c727c6f3a69',
      tag: 'Technology'
    },
    {
      _id: '019a6185-c288-778c-8560-595170b9219e',
      user: '019a0427-0b08-7b94-90ca-0c727c6f3a69',
      tag: 'Book'
    }
  ]
} => { request: '019a61a0-f67c-7a5a-aff3-d5ab226fe29b' }
[Requesting] Received request for path: /Event/_getEventsByRecommendationContext
Requesting.request {
  session: '019a619f-3172-7965-90cf-d26bbadd6658',
  filters: 'Recycling,Technology,Book',
  priorities: 'upcoming',
  path: '/Event/_getEventsByRecommendationContext'
} => { request: '019a61a0-f87a-7b5a-bc92-118233adb638' }
🤖 Requesting AI-augmented recommendations from LLM...
✅ Received response from LLM!
🤖 RAW LLM RESPONSE
======================
```json
{
  "recommendations": [
    {
      "name": "Film Screening: Future Cities",
      "reason": "This event matches the 'Technology' filter and is upcoming. The description mentions 'technology shaping the sustainable cities of tomorrow', aligning with the technology theme."
    },
    {
      "name": "Women in Tech Networking Night",
      "reason": "This event matches the 'Technology' filter and is upcoming. It specifically targets professionals in the tech scene."
    },
    {
      "name": "Book Swap",
      "reason": "This event matches the 'Book' filter and is upcoming. It is a book exchange event."
    }
  ]
}
```
======================
📝 Applying LLM recommendations...
✅ Recommended "Film Screening: Future Cities" (This event matches the 'Technology' filter and is upcoming. The description mentions 'technology shaping the sustainable cities of tomorrow', aligning with the technology theme.)
✅ Recommended "Women in Tech Networking Night" (This event matches the 'Technology' filter and is upcoming. It specifically targets professionals in the tech scene.)
✅ Recommended "Book Swap" (This event matches the 'Book' filter and is upcoming. It is a book exchange event.)
Requesting.respond {
  request: '019a61a0-f87a-7b5a-bc92-118233adb638',
  results: [
    {
      _id: '019a27b4-1b28-7804-a4cb-4630f02ff044',
      organizer: '019a0427-0b08-7b94-90ca-0c727c6f3a69',
      name: 'Film Screening: Future Cities',
      date: 2025-11-07T01:30:00.000Z,
      duration: 60,
      location: 'Coolidge Corner Theatre, Brookline, MA',
      description: 'A documentary exploring the technology shaping the sustainable cities of tomorrow.',
      status: 'completed'
    },
    {
      _id: '019a27b5-1b01-7c15-b048-4ca71e18431e',
      organizer: '019a0427-0b08-7b94-90ca-0c727c6f3a69',
      name: 'Women in Tech Networking Night',
      date: 2025-11-15T23:00:00.000Z,
      duration: 60,
      location: 'HubSpot HQ, Cambridge, MA',
      description: 'An evening to connect women and nonbinary professionals in the Boston tech scene.',
      status: 'upcoming'
    },
    {
      _id: '019a617b-2394-7e75-9630-075fbf76d9a6',
      organizer: '019a0427-0b08-7b94-90ca-0c727c6f3a69',
      name: 'Book Swap',
      date: 2025-11-21T19:00:00.000Z,
      duration: 60,
      location: 'Hayden Library',
      description: 'Bring a book you’ve finished and exchange it for something new! A cozy event with light snacks, discussion tables, and a “blind date with a book” raffle.',
      status: 'upcoming'
    }
  ],
  error: null
} => { request: '019a61a0-f87a-7b5a-bc92-118233adb638' }
[Requesting] Received request for path: /Event/_getEventsByStatus
Requesting.request {
  session: '019a619f-3172-7965-90cf-d26bbadd6658',
  status: 'upcoming',
  path: '/Event/_getEventsByStatus'
} => { request: '019a61a0-fde2-71b4-a7fe-ddd11a523697' }
Requesting.respond {
  request: '019a61a0-fde2-71b4-a7fe-ddd11a523697',
  results: [
    {
      _id: '019a27b5-1b01-7c15-b048-4ca71e18431e',
      organizer: '019a0427-0b08-7b94-90ca-0c727c6f3a69',
      name: 'Women in Tech Networking Night',
      date: 2025-11-15T23:00:00.000Z,
      duration: 60,
      location: 'HubSpot HQ, Cambridge, MA',
      description: 'An evening to connect women and nonbinary professionals in the Boston tech scene.',
      status: 'upcoming'
    },
    {
      _id: '019a617a-0ab4-735f-b7c2-ccbdd38f234f',
      organizer: '019a0427-0b08-7b94-90ca-0c727c6f3a69',
      name: 'Late Night Study Break',
      date: 2025-11-12T22:00:00.000Z,
      duration: 60,
      location: 'Student Center',
      description: 'Take a break from midterms! Stop by the student center for free pizza, games, and trivia. Open to all undergrads — bring your friends and de-stress before exams.',
      status: 'upcoming'
    },
    {
      _id: '019a617a-93cd-7ad2-8860-8ac6834fede0',
      organizer: '019a0427-0b08-7b94-90ca-0c727c6f3a69',
      name: 'Intramural Soccer Finals',
      date: 2025-11-18T00:00:00.000Z,
      duration: 60,
      location: 'Briggs Field',
      description: 'Cheer on your favorite teams as they compete for the intramural championship! Food, prizes, and halftime mini-games included.',
      status: 'upcoming'
    },
    {
      _id: '019a617b-2394-7e75-9630-075fbf76d9a6',
      organizer: '019a0427-0b08-7b94-90ca-0c727c6f3a69',
      name: 'Book Swap',
      date: 2025-11-21T19:00:00.000Z,
      duration: 60,
      location: 'Hayden Library',
      description: 'Bring a book you’ve finished and exchange it for something new! A cozy event with light snacks, discussion tables, and a “blind date with a book” raffle.',
      status: 'upcoming'
    }
  ]
} => { request: '019a61a0-fde2-71b4-a7fe-ddd11a523697' }
[Requesting] Received request for path: /UserInterest/_getUsersInterestedInItems
[Requesting] Received request for path: /UserInterest/_getUsersInterestedInItems
[Requesting] Received request for path: /UserInterest/_getUsersInterestedInItems
[Requesting] Received request for path: /UserInterest/_getUsersInterestedInItems
Requesting.request {
  session: '019a619f-3172-7965-90cf-d26bbadd6658',
  item: '019a27b5-1b01-7c15-b048-4ca71e18431e',
  path: '/UserInterest/_getUsersInterestedInItems'
} => { request: '019a61a1-008d-73ce-95e0-623ebe4f6eda' }
Requesting.request {
  session: '019a619f-3172-7965-90cf-d26bbadd6658',
  item: '019a617b-2394-7e75-9630-075fbf76d9a6',
  path: '/UserInterest/_getUsersInterestedInItems'
} => { request: '019a61a1-0094-765c-a125-eb0119d1b95a' }
Requesting.request {
  session: '019a619f-3172-7965-90cf-d26bbadd6658',
  item: '019a617a-0ab4-735f-b7c2-ccbdd38f234f',
  path: '/UserInterest/_getUsersInterestedInItems'
} => { request: '019a61a1-0097-7398-ac6a-d608bacdb735' }
Requesting.request {
  session: '019a619f-3172-7965-90cf-d26bbadd6658',
  item: '019a617a-93cd-7ad2-8860-8ac6834fede0',
  path: '/UserInterest/_getUsersInterestedInItems'
} => { request: '019a61a1-0098-7491-acba-0219822914ac' }
Requesting.respond { request: '019a61a1-008d-73ce-95e0-623ebe4f6eda', results: [] } => { request: '019a61a1-008d-73ce-95e0-623ebe4f6eda' }
Requesting.respond { request: '019a61a1-0097-7398-ac6a-d608bacdb735', results: [] } => { request: '019a61a1-0097-7398-ac6a-d608bacdb735' }
Requesting.respond {
  request: '019a61a1-0094-765c-a125-eb0119d1b95a',
  results: [ { user: '019a0427-0b08-7b94-90ca-0c727c6f3a69' } ]
} => { request: '019a61a1-0094-765c-a125-eb0119d1b95a' }
Requesting.respond { request: '019a61a1-0098-7491-acba-0219822914ac', results: [] } => { request: '019a61a1-0098-7491-acba-0219822914ac' }
[Requesting] Received request for path: /UserInterest/_getItemInterests
Requesting.request {
  session: '019a619f-3172-7965-90cf-d26bbadd6658',
  path: '/UserInterest/_getItemInterests'
} => { request: '019a61a1-02d1-7f35-b3a7-476970f7aec2' }
[Requesting] Received request for path: /UserInterest/_getPersonalInterests
Requesting.request {
  session: '019a619f-3172-7965-90cf-d26bbadd6658',
  path: '/UserInterest/_getPersonalInterests'
} => { request: '019a61a1-03a7-7173-9474-736c02f9f50c' }
Requesting.respond {
  request: '019a61a1-02d1-7f35-b3a7-476970f7aec2',
  results: [
    {
      _id: '019a09e1-3bba-73a0-9952-a7263d3b0c4e',
      user: '019a0427-0b08-7b94-90ca-0c727c6f3a69',
      item: '019a09c2-c849-7225-8763-f8fdfbe9108a'
    },
    {
      _id: '019a09e1-5d2c-7cba-b520-fc894dad5fb8',
      user: '019a0427-0b08-7b94-90ca-0c727c6f3a69',
      item: '019a09de-3772-7a24-8578-2c85fceeb008'
    },
    {
      _id: '019a0a06-bce0-7ad9-97b6-f875bb578438',
      user: '019a0427-0b08-7b94-90ca-0c727c6f3a69',
      item: '019a0a06-9f88-7846-aab4-69782ae9e5e2'
    },
    {
      _id: '019a0a1e-8bd8-7229-8039-00d7ccb7da37',
      user: '019a0427-0b08-7b94-90ca-0c727c6f3a69',
      item: '019a0a1e-7304-7d40-b744-3906f9412adb'
    },
    {
      _id: '019a2284-1e81-7269-94bd-0a468a05f2f4',
      user: '019a0427-0b08-7b94-90ca-0c727c6f3a69',
      item: '019a227d-06db-7fb3-9350-7b420562de68'
    },
    {
      _id: '019a271b-f74b-741c-a629-fbd34071da29',
      user: '019a0427-0b08-7b94-90ca-0c727c6f3a69',
      item: '019a2718-40a6-7b30-a403-a905f48338ef'
    },
    {
      _id: '019a2dec-af43-7f88-98a8-5285f6518fef',
      user: '019a0427-0b08-7b94-90ca-0c727c6f3a69',
      item: '019a27b1-724b-7741-ac95-ae204782cb2e'
    },
    {
      _id: '019a6155-3de4-71cd-b7da-12f8627a0dbf',
      user: '019a0427-0b08-7b94-90ca-0c727c6f3a69',
      item: '019a60ca-6cb4-7e20-85b5-ce13f0f8b227'
    },
    {
      _id: '019a619f-a6ee-7e10-90c8-b4f5d35c41f7',
      user: '019a0427-0b08-7b94-90ca-0c727c6f3a69',
      item: '019a617b-2394-7e75-9630-075fbf76d9a6'
    }
  ]
} => { request: '019a61a1-02d1-7f35-b3a7-476970f7aec2' }
Requesting.respond {
  request: '019a61a1-03a7-7173-9474-736c02f9f50c',
  results: [
    {
      _id: '019a2876-479f-7587-a931-2863c4c428c5',
      user: '019a0427-0b08-7b94-90ca-0c727c6f3a69',
      tag: 'Recycling'
    },
    {
      _id: '019a60af-d8b6-71cb-bca4-86426e4fc7b3',
      user: '019a0427-0b08-7b94-90ca-0c727c6f3a69',
      tag: 'Technology'
    },
    {
      _id: '019a6185-c288-778c-8560-595170b9219e',
      user: '019a0427-0b08-7b94-90ca-0c727c6f3a69',
      tag: 'Book'
    }
  ]
} => { request: '019a61a1-03a7-7173-9474-736c02f9f50c' }
[Requesting] Received request for path: /UserInterest/_getItemInterests
Requesting.request {
  session: '019a619f-3172-7965-90cf-d26bbadd6658',
  path: '/UserInterest/_getItemInterests'
} => { request: '019a61a1-055f-7ab3-b318-d560a3e5c02e' }
[Requesting] Received request for path: /Event/_getEventsByOrganizer
Requesting.request {
  session: '019a619f-3172-7965-90cf-d26bbadd6658',
  organizer: '019a0427-0b08-7b94-90ca-0c727c6f3a69',
  path: '/Event/_getEventsByOrganizer'
} => { request: '019a61a1-05c1-7c8e-9be6-ff05c48bec5c' }
Requesting.respond {
  request: '019a61a1-055f-7ab3-b318-d560a3e5c02e',
  results: [
    {
      _id: '019a09e1-3bba-73a0-9952-a7263d3b0c4e',
      user: '019a0427-0b08-7b94-90ca-0c727c6f3a69',
      item: '019a09c2-c849-7225-8763-f8fdfbe9108a'
    },
    {
      _id: '019a09e1-5d2c-7cba-b520-fc894dad5fb8',
      user: '019a0427-0b08-7b94-90ca-0c727c6f3a69',
      item: '019a09de-3772-7a24-8578-2c85fceeb008'
    },
    {
      _id: '019a0a06-bce0-7ad9-97b6-f875bb578438',
      user: '019a0427-0b08-7b94-90ca-0c727c6f3a69',
      item: '019a0a06-9f88-7846-aab4-69782ae9e5e2'
    },
    {
      _id: '019a0a1e-8bd8-7229-8039-00d7ccb7da37',
      user: '019a0427-0b08-7b94-90ca-0c727c6f3a69',
      item: '019a0a1e-7304-7d40-b744-3906f9412adb'
    },
    {
      _id: '019a2284-1e81-7269-94bd-0a468a05f2f4',
      user: '019a0427-0b08-7b94-90ca-0c727c6f3a69',
      item: '019a227d-06db-7fb3-9350-7b420562de68'
    },
    {
      _id: '019a271b-f74b-741c-a629-fbd34071da29',
      user: '019a0427-0b08-7b94-90ca-0c727c6f3a69',
      item: '019a2718-40a6-7b30-a403-a905f48338ef'
    },
    {
      _id: '019a2dec-af43-7f88-98a8-5285f6518fef',
      user: '019a0427-0b08-7b94-90ca-0c727c6f3a69',
      item: '019a27b1-724b-7741-ac95-ae204782cb2e'
    },
    {
      _id: '019a6155-3de4-71cd-b7da-12f8627a0dbf',
      user: '019a0427-0b08-7b94-90ca-0c727c6f3a69',
      item: '019a60ca-6cb4-7e20-85b5-ce13f0f8b227'
    },
    {
      _id: '019a619f-a6ee-7e10-90c8-b4f5d35c41f7',
      user: '019a0427-0b08-7b94-90ca-0c727c6f3a69',
      item: '019a617b-2394-7e75-9630-075fbf76d9a6'
    }
  ]
} => { request: '019a61a1-055f-7ab3-b318-d560a3e5c02e' }
Requesting.respond {
  request: '019a61a1-05c1-7c8e-9be6-ff05c48bec5c',
  results: [
    {
      _id: '019a09f9-0d35-7dfa-8056-c8b33dac8f36',
      organizer: '019a0427-0b08-7b94-90ca-0c727c6f3a69',
      name: 'Study Break',
      date: 2025-10-22T03:32:00.000Z,
      duration: 1,
      location: 'Burton-Conner',
      description: 'Take a break from studying and eat snacks!',
      status: 'completed'
    },
    {
      _id: '019a0a06-9f88-7846-aab4-69782ae9e5e2',
      organizer: '019a0427-0b08-7b94-90ca-0c727c6f3a69',
      name: 'test',
      date: 2025-10-22T16:00:00.000Z,
      duration: 60,
      location: 'test',
      description: 'test...',
      status: 'completed'
    },
    {
      _id: '019a0a1e-7304-7d40-b744-3906f9412adb',
      organizer: '019a0427-0b08-7b94-90ca-0c727c6f3a69',
      name: 'testing_history',
      date: 2025-10-22T04:13:00.000Z,
      duration: 1,
      location: 'test',
      description: 'test',
      status: 'completed'
    },
    {
      _id: '019a27b1-724b-7741-ac95-ae204782cb2e',
      organizer: '019a0427-0b08-7b94-90ca-0c727c6f3a69',
      name: 'Boston Fall Food Festival',
      date: 2025-11-01T16:00:00.000Z,
      duration: 180,
      location: 'Boston',
      description: 'Sample dishes from over 50 local restaurants and food trucks celebrating seasonal flavors.',
      status: 'completed'
    },
    {
      _id: '019a27b2-388d-7639-b14d-c251b555ca81',
      organizer: '019a0427-0b08-7b94-90ca-0c727c6f3a69',
      name: 'Sunset Yoga by the Charles',
      date: 2025-11-01T21:00:00.000Z,
      duration: 60,
      location: 'Esplanade Park, Boston, MA',
      description: 'A calming yoga session at sunset for all levels, hosted by local instructors.',
      status: 'completed'
    },
    {
      _id: '019a27b2-e903-701f-80f7-c69986f559ca',
      organizer: '019a0427-0b08-7b94-90ca-0c727c6f3a69',
      name: 'Intro to Digital Illustration',
      date: 2025-11-02T00:00:00.000Z,
      duration: 60,
      location: 'Boston Center for the Arts',
      description: 'A beginner-friendly workshop introducing techniques in digital drawing using Procreate.',
      status: 'completed'
    },
    {
      _id: '019a27b3-7141-75c7-8e2b-9a27f1db7e8d',
      organizer: '019a0427-0b08-7b94-90ca-0c727c6f3a69',
      name: 'Climate Change Policy Panel',
      date: 2025-11-03T22:00:00.000Z,
      duration: 60,
      location: 'Harvard Kennedy School, Cambridge, MA',
      description: 'Experts discuss actionable policy solutions to mitigate climate change.',
      status: 'completed'
    },
    {
      _id: '019a27b4-1b28-7804-a4cb-4630f02ff044',
      organizer: '019a0427-0b08-7b94-90ca-0c727c6f3a69',
      name: 'Film Screening: Future Cities',
      date: 2025-11-07T01:30:00.000Z,
      duration: 60,
      location: 'Coolidge Corner Theatre, Brookline, MA',
      description: 'A documentary exploring the technology shaping the sustainable cities of tomorrow.',
      status: 'completed'
    },
    {
      _id: '019a27b5-1b01-7c15-b048-4ca71e18431e',
      organizer: '019a0427-0b08-7b94-90ca-0c727c6f3a69',
      name: 'Women in Tech Networking Night',
      date: 2025-11-15T23:00:00.000Z,
      duration: 60,
      location: 'HubSpot HQ, Cambridge, MA',
      description: 'An evening to connect women and nonbinary professionals in the Boston tech scene.',
      status: 'upcoming'
    },
    {
      _id: '019a60ca-6cb4-7e20-85b5-ce13f0f8b227',
      organizer: '019a0427-0b08-7b94-90ca-0c727c6f3a69',
      name: 'The Fourth Witch',
      date: 2025-11-08T01:00:00.000Z,
      duration: 120,
      location: 'Paramount Theater',
      description: 'A Macbeth-based play involving a puppet show.',
      status: 'completed'
    },
    {
      _id: '019a617a-0ab4-735f-b7c2-ccbdd38f234f',
      organizer: '019a0427-0b08-7b94-90ca-0c727c6f3a69',
      name: 'Late Night Study Break',
      date: 2025-11-12T22:00:00.000Z,
      duration: 60,
      location: 'Student Center',
      description: 'Take a break from midterms! Stop by the student center for free pizza, games, and trivia. Open to all undergrads — bring your friends and de-stress before exams.',
      status: 'upcoming'
    },
    {
      _id: '019a617a-93cd-7ad2-8860-8ac6834fede0',
      organizer: '019a0427-0b08-7b94-90ca-0c727c6f3a69',
      name: 'Intramural Soccer Finals',
      date: 2025-11-18T00:00:00.000Z,
      duration: 60,
      location: 'Briggs Field',
      description: 'Cheer on your favorite teams as they compete for the intramural championship! Food, prizes, and halftime mini-games included.',
      status: 'upcoming'
    },
    {
      _id: '019a617b-2394-7e75-9630-075fbf76d9a6',
      organizer: '019a0427-0b08-7b94-90ca-0c727c6f3a69',
      name: 'Book Swap',
      date: 2025-11-21T19:00:00.000Z,
      duration: 60,
      location: 'Hayden Library',
      description: 'Bring a book you’ve finished and exchange it for something new! A cozy event with light snacks, discussion tables, and a “blind date with a book” raffle.',
      status: 'upcoming'
    }
  ]
} => { request: '019a61a1-05c1-7c8e-9be6-ff05c48bec5c' }
[Requesting] Received request for path: /Event/_getEventById
[Requesting] Received request for path: /Event/_getEventById
[Requesting] Received request for path: /Event/_getEventById
[Requesting] Received request for path: /Event/_getEventById
[Requesting] Received request for path: /Event/_getEventById
[Requesting] Received request for path: /Event/_getEventById
[Requesting] Received request for path: /Event/_getEventById
[Requesting] Received request for path: /Event/_getEventById
[Requesting] Received request for path: /Event/_getEventById
Requesting.request {
  session: '019a619f-3172-7965-90cf-d26bbadd6658',
  event: '019a27b1-724b-7741-ac95-ae204782cb2e',
  path: '/Event/_getEventById'
} => { request: '019a61a1-07de-75b9-ad6d-784b9c9f5a3c' }
Requesting.request {
  session: '019a619f-3172-7965-90cf-d26bbadd6658',
  event: '019a617b-2394-7e75-9630-075fbf76d9a6',
  path: '/Event/_getEventById'
} => { request: '019a61a1-07eb-7daf-9d90-ba9c0247f82c' }
Requesting.request {
  session: '019a619f-3172-7965-90cf-d26bbadd6658',
  event: '019a2718-40a6-7b30-a403-a905f48338ef',
  path: '/Event/_getEventById'
} => { request: '019a61a1-07fb-772b-a7e2-4fa58a0abd83' }
Requesting.request {
  session: '019a619f-3172-7965-90cf-d26bbadd6658',
  event: '019a0a06-9f88-7846-aab4-69782ae9e5e2',
  path: '/Event/_getEventById'
} => { request: '019a61a1-07fa-7543-bf0f-2dd670d2f462' }
Requesting.request {
  session: '019a619f-3172-7965-90cf-d26bbadd6658',
  event: '019a0a1e-7304-7d40-b744-3906f9412adb',
  path: '/Event/_getEventById'
} => { request: '019a61a1-07f6-742f-aa22-af3a18d2ff28' }
Requesting.request {
  session: '019a619f-3172-7965-90cf-d26bbadd6658',
  event: '019a09c2-c849-7225-8763-f8fdfbe9108a',
  path: '/Event/_getEventById'
} => { request: '019a61a1-07f7-78ce-a1d6-d06021c068f8' }
Requesting.request {
  session: '019a619f-3172-7965-90cf-d26bbadd6658',
  event: '019a227d-06db-7fb3-9350-7b420562de68',
  path: '/Event/_getEventById'
} => { request: '019a61a1-07f7-7a2c-8ba1-9b3cd95146db' }
Requesting.request {
  session: '019a619f-3172-7965-90cf-d26bbadd6658',
  event: '019a60ca-6cb4-7e20-85b5-ce13f0f8b227',
  path: '/Event/_getEventById'
} => { request: '019a61a1-07f7-7ce7-bb2b-4f0cf22b9978' }
Requesting.request {
  session: '019a619f-3172-7965-90cf-d26bbadd6658',
  event: '019a09de-3772-7a24-8578-2c85fceeb008',
  path: '/Event/_getEventById'
} => { request: '019a61a1-0806-72f4-b57e-ea3689f7d7bb' }
Requesting.respond {
  request: '019a61a1-07de-75b9-ad6d-784b9c9f5a3c',
  event: {
    _id: '019a27b1-724b-7741-ac95-ae204782cb2e',
    organizer: '019a0427-0b08-7b94-90ca-0c727c6f3a69',
    name: 'Boston Fall Food Festival',
    date: 2025-11-01T16:00:00.000Z,
    duration: 180,
    location: 'Boston',
    description: 'Sample dishes from over 50 local restaurants and food trucks celebrating seasonal flavors.',
    status: 'completed'
  }
} => { request: '019a61a1-07de-75b9-ad6d-784b9c9f5a3c' }
Requesting.respond { request: '019a61a1-07f7-7a2c-8ba1-9b3cd95146db', event: null } => { request: '019a61a1-07f7-7a2c-8ba1-9b3cd95146db' }
Requesting.respond {
  request: '019a61a1-07fb-772b-a7e2-4fa58a0abd83',
  event: {
    _id: '019a2718-40a6-7b30-a403-a905f48338ef',
    organizer: '019a2702-adbc-75ba-931c-c0e72cf707b5',
    name: 'new',
    date: 2025-10-27T21:00:00.000Z,
    duration: 60,
    location: 'test',
    description: 'TEST',
    status: 'completed'
  }
} => { request: '019a61a1-07fb-772b-a7e2-4fa58a0abd83' }
Requesting.respond {
  request: '019a61a1-07f6-742f-aa22-af3a18d2ff28',
  event: {
    _id: '019a0a1e-7304-7d40-b744-3906f9412adb',
    organizer: '019a0427-0b08-7b94-90ca-0c727c6f3a69',
    name: 'testing_history',
    date: 2025-10-22T04:13:00.000Z,
    duration: 1,
    location: 'test',
    description: 'test',
    status: 'completed'
  }
} => { request: '019a61a1-07f6-742f-aa22-af3a18d2ff28' }
Requesting.respond {
  request: '019a61a1-07f7-7ce7-bb2b-4f0cf22b9978',
  event: {
    _id: '019a60ca-6cb4-7e20-85b5-ce13f0f8b227',
    organizer: '019a0427-0b08-7b94-90ca-0c727c6f3a69',
    name: 'The Fourth Witch',
    date: 2025-11-08T01:00:00.000Z,
    duration: 120,
    location: 'Paramount Theater',
    description: 'A Macbeth-based play involving a puppet show.',
    status: 'completed'
  }
} => { request: '019a61a1-07f7-7ce7-bb2b-4f0cf22b9978' }
Requesting.respond { request: '019a61a1-07f7-78ce-a1d6-d06021c068f8', event: null } => { request: '019a61a1-07f7-78ce-a1d6-d06021c068f8' }
Requesting.respond {
  request: '019a61a1-07eb-7daf-9d90-ba9c0247f82c',
  event: {
    _id: '019a617b-2394-7e75-9630-075fbf76d9a6',
    organizer: '019a0427-0b08-7b94-90ca-0c727c6f3a69',
    name: 'Book Swap',
    date: 2025-11-21T19:00:00.000Z,
    duration: 60,
    location: 'Hayden Library',
    description: 'Bring a book you’ve finished and exchange it for something new! A cozy event with light snacks, discussion tables, and a “blind date with a book” raffle.',
    status: 'upcoming'
  }
} => { request: '019a61a1-07eb-7daf-9d90-ba9c0247f82c' }
Requesting.respond { request: '019a61a1-0806-72f4-b57e-ea3689f7d7bb', event: null } => { request: '019a61a1-0806-72f4-b57e-ea3689f7d7bb' }
Requesting.respond {
  request: '019a61a1-07fa-7543-bf0f-2dd670d2f462',
  event: {
    _id: '019a0a06-9f88-7846-aab4-69782ae9e5e2',
    organizer: '019a0427-0b08-7b94-90ca-0c727c6f3a69',
    name: 'test',
    date: 2025-10-22T16:00:00.000Z,
    duration: 60,
    location: 'test',
    description: 'test...',
    status: 'completed'
  }
} => { request: '019a61a1-07fa-7543-bf0f-2dd670d2f462' }
[Requesting] Received request for path: /Event/_getEventById
[Requesting] Received request for path: /Event/_getEventById
Requesting.request {
  session: '019a619f-3172-7965-90cf-d26bbadd6658',
  event: '019a27b1-724b-7741-ac95-ae204782cb2e',
  path: '/Event/_getEventById'
} => { request: '019a61a1-0a6d-7c3a-ba6a-4a40bd7af65e' }
Requesting.request {
  session: '019a619f-3172-7965-90cf-d26bbadd6658',
  event: '019a0a06-9f88-7846-aab4-69782ae9e5e2',
  path: '/Event/_getEventById'
} => { request: '019a61a1-0a72-7294-9bde-48e76f3cfebc' }
Requesting.respond {
  request: '019a61a1-0a6d-7c3a-ba6a-4a40bd7af65e',
  event: {
    _id: '019a27b1-724b-7741-ac95-ae204782cb2e',
    organizer: '019a0427-0b08-7b94-90ca-0c727c6f3a69',
    name: 'Boston Fall Food Festival',
    date: 2025-11-01T16:00:00.000Z,
    duration: 180,
    location: 'Boston',
    description: 'Sample dishes from over 50 local restaurants and food trucks celebrating seasonal flavors.',
    status: 'completed'
  }
} => { request: '019a61a1-0a6d-7c3a-ba6a-4a40bd7af65e' }
Requesting.respond {
  request: '019a61a1-0a72-7294-9bde-48e76f3cfebc',
  event: {
    _id: '019a0a06-9f88-7846-aab4-69782ae9e5e2',
    organizer: '019a0427-0b08-7b94-90ca-0c727c6f3a69',
    name: 'test',
    date: 2025-10-22T16:00:00.000Z,
    duration: 60,
    location: 'test',
    description: 'test...',
    status: 'completed'
  }
} => { request: '019a61a1-0a72-7294-9bde-48e76f3cfebc' }
[Requesting] Received request for path: /Event/_getEventsByOrganizer
[Requesting] Received request for path: /UserInterest/_getItemInterests
Requesting.request {
  session: '019a619f-3172-7965-90cf-d26bbadd6658',
  organizer: '019a0427-0b08-7b94-90ca-0c727c6f3a69',
  path: '/Event/_getEventsByOrganizer'
} => { request: '019a61a1-0c37-7219-941a-604149b9eb95' }
Requesting.request {
  session: '019a619f-3172-7965-90cf-d26bbadd6658',
  path: '/UserInterest/_getItemInterests'
} => { request: '019a61a1-0c38-715f-a0f5-8d7befa6f10c' }
Requesting.respond {
  request: '019a61a1-0c37-7219-941a-604149b9eb95',
  results: [
    {
      _id: '019a09f9-0d35-7dfa-8056-c8b33dac8f36',
      organizer: '019a0427-0b08-7b94-90ca-0c727c6f3a69',
      name: 'Study Break',
      date: 2025-10-22T03:32:00.000Z,
      duration: 1,
      location: 'Burton-Conner',
      description: 'Take a break from studying and eat snacks!',
      status: 'completed'
    },
    {
      _id: '019a0a06-9f88-7846-aab4-69782ae9e5e2',
      organizer: '019a0427-0b08-7b94-90ca-0c727c6f3a69',
      name: 'test',
      date: 2025-10-22T16:00:00.000Z,
      duration: 60,
      location: 'test',
      description: 'test...',
      status: 'completed'
    },
    {
      _id: '019a0a1e-7304-7d40-b744-3906f9412adb',
      organizer: '019a0427-0b08-7b94-90ca-0c727c6f3a69',
      name: 'testing_history',
      date: 2025-10-22T04:13:00.000Z,
      duration: 1,
      location: 'test',
      description: 'test',
      status: 'completed'
    },
    {
      _id: '019a27b1-724b-7741-ac95-ae204782cb2e',
      organizer: '019a0427-0b08-7b94-90ca-0c727c6f3a69',
      name: 'Boston Fall Food Festival',
      date: 2025-11-01T16:00:00.000Z,
      duration: 180,
      location: 'Boston',
      description: 'Sample dishes from over 50 local restaurants and food trucks celebrating seasonal flavors.',
      status: 'completed'
    },
    {
      _id: '019a27b2-388d-7639-b14d-c251b555ca81',
      organizer: '019a0427-0b08-7b94-90ca-0c727c6f3a69',
      name: 'Sunset Yoga by the Charles',
      date: 2025-11-01T21:00:00.000Z,
      duration: 60,
      location: 'Esplanade Park, Boston, MA',
      description: 'A calming yoga session at sunset for all levels, hosted by local instructors.',
      status: 'completed'
    },
    {
      _id: '019a27b2-e903-701f-80f7-c69986f559ca',
      organizer: '019a0427-0b08-7b94-90ca-0c727c6f3a69',
      name: 'Intro to Digital Illustration',
      date: 2025-11-02T00:00:00.000Z,
      duration: 60,
      location: 'Boston Center for the Arts',
      description: 'A beginner-friendly workshop introducing techniques in digital drawing using Procreate.',
      status: 'completed'
    },
    {
      _id: '019a27b3-7141-75c7-8e2b-9a27f1db7e8d',
      organizer: '019a0427-0b08-7b94-90ca-0c727c6f3a69',
      name: 'Climate Change Policy Panel',
      date: 2025-11-03T22:00:00.000Z,
      duration: 60,
      location: 'Harvard Kennedy School, Cambridge, MA',
      description: 'Experts discuss actionable policy solutions to mitigate climate change.',
      status: 'completed'
    },
    {
      _id: '019a27b4-1b28-7804-a4cb-4630f02ff044',
      organizer: '019a0427-0b08-7b94-90ca-0c727c6f3a69',
      name: 'Film Screening: Future Cities',
      date: 2025-11-07T01:30:00.000Z,
      duration: 60,
      location: 'Coolidge Corner Theatre, Brookline, MA',
      description: 'A documentary exploring the technology shaping the sustainable cities of tomorrow.',
      status: 'completed'
    },
    {
      _id: '019a27b5-1b01-7c15-b048-4ca71e18431e',
      organizer: '019a0427-0b08-7b94-90ca-0c727c6f3a69',
      name: 'Women in Tech Networking Night',
      date: 2025-11-15T23:00:00.000Z,
      duration: 60,
      location: 'HubSpot HQ, Cambridge, MA',
      description: 'An evening to connect women and nonbinary professionals in the Boston tech scene.',
      status: 'upcoming'
    },
    {
      _id: '019a60ca-6cb4-7e20-85b5-ce13f0f8b227',
      organizer: '019a0427-0b08-7b94-90ca-0c727c6f3a69',
      name: 'The Fourth Witch',
      date: 2025-11-08T01:00:00.000Z,
      duration: 120,
      location: 'Paramount Theater',
      description: 'A Macbeth-based play involving a puppet show.',
      status: 'completed'
    },
    {
      _id: '019a617a-0ab4-735f-b7c2-ccbdd38f234f',
      organizer: '019a0427-0b08-7b94-90ca-0c727c6f3a69',
      name: 'Late Night Study Break',
      date: 2025-11-12T22:00:00.000Z,
      duration: 60,
      location: 'Student Center',
      description: 'Take a break from midterms! Stop by the student center for free pizza, games, and trivia. Open to all undergrads — bring your friends and de-stress before exams.',
      status: 'upcoming'
    },
    {
      _id: '019a617a-93cd-7ad2-8860-8ac6834fede0',
      organizer: '019a0427-0b08-7b94-90ca-0c727c6f3a69',
      name: 'Intramural Soccer Finals',
      date: 2025-11-18T00:00:00.000Z,
      duration: 60,
      location: 'Briggs Field',
      description: 'Cheer on your favorite teams as they compete for the intramural championship! Food, prizes, and halftime mini-games included.',
      status: 'upcoming'
    },
    {
      _id: '019a617b-2394-7e75-9630-075fbf76d9a6',
      organizer: '019a0427-0b08-7b94-90ca-0c727c6f3a69',
      name: 'Book Swap',
      date: 2025-11-21T19:00:00.000Z,
      duration: 60,
      location: 'Hayden Library',
      description: 'Bring a book you’ve finished and exchange it for something new! A cozy event with light snacks, discussion tables, and a “blind date with a book” raffle.',
      status: 'upcoming'
    }
  ]
} => { request: '019a61a1-0c37-7219-941a-604149b9eb95' }
Requesting.respond {
  request: '019a61a1-0c38-715f-a0f5-8d7befa6f10c',
  results: [
    {
      _id: '019a09e1-3bba-73a0-9952-a7263d3b0c4e',
      user: '019a0427-0b08-7b94-90ca-0c727c6f3a69',
      item: '019a09c2-c849-7225-8763-f8fdfbe9108a'
    },
    {
      _id: '019a09e1-5d2c-7cba-b520-fc894dad5fb8',
      user: '019a0427-0b08-7b94-90ca-0c727c6f3a69',
      item: '019a09de-3772-7a24-8578-2c85fceeb008'
    },
    {
      _id: '019a0a06-bce0-7ad9-97b6-f875bb578438',
      user: '019a0427-0b08-7b94-90ca-0c727c6f3a69',
      item: '019a0a06-9f88-7846-aab4-69782ae9e5e2'
    },
    {
      _id: '019a0a1e-8bd8-7229-8039-00d7ccb7da37',
      user: '019a0427-0b08-7b94-90ca-0c727c6f3a69',
      item: '019a0a1e-7304-7d40-b744-3906f9412adb'
    },
    {
      _id: '019a2284-1e81-7269-94bd-0a468a05f2f4',
      user: '019a0427-0b08-7b94-90ca-0c727c6f3a69',
      item: '019a227d-06db-7fb3-9350-7b420562de68'
    },
    {
      _id: '019a271b-f74b-741c-a629-fbd34071da29',
      user: '019a0427-0b08-7b94-90ca-0c727c6f3a69',
      item: '019a2718-40a6-7b30-a403-a905f48338ef'
    },
    {
      _id: '019a2dec-af43-7f88-98a8-5285f6518fef',
      user: '019a0427-0b08-7b94-90ca-0c727c6f3a69',
      item: '019a27b1-724b-7741-ac95-ae204782cb2e'
    },
    {
      _id: '019a6155-3de4-71cd-b7da-12f8627a0dbf',
      user: '019a0427-0b08-7b94-90ca-0c727c6f3a69',
      item: '019a60ca-6cb4-7e20-85b5-ce13f0f8b227'
    },
    {
      _id: '019a619f-a6ee-7e10-90c8-b4f5d35c41f7',
      user: '019a0427-0b08-7b94-90ca-0c727c6f3a69',
      item: '019a617b-2394-7e75-9630-075fbf76d9a6'
    }
  ]
} => { request: '019a61a1-0c38-715f-a0f5-8d7befa6f10c' }
[Requesting] Received request for path: /Event/_getEventById
Requesting.request {
  session: '019a619f-3172-7965-90cf-d26bbadd6658',
  event: '019a09c2-c849-7225-8763-f8fdfbe9108a',
  path: '/Event/_getEventById'
} => { request: '019a61a1-0e04-785e-9d5f-910ae0a2f5d1' }
Requesting.respond { request: '019a61a1-0e04-785e-9d5f-910ae0a2f5d1', event: null } => { request: '019a61a1-0e04-785e-9d5f-910ae0a2f5d1' }
[Requesting] Received request for path: /Event/_getEventById
Requesting.request {
  session: '019a619f-3172-7965-90cf-d26bbadd6658',
  event: '019a09de-3772-7a24-8578-2c85fceeb008',
  path: '/Event/_getEventById'
} => { request: '019a61a1-0fb6-75a9-96d7-3135c698222e' }
Requesting.respond { request: '019a61a1-0fb6-75a9-96d7-3135c698222e', event: null } => { request: '019a61a1-0fb6-75a9-96d7-3135c698222e' }
[Requesting] Received request for path: /Event/_getEventById
Requesting.request {
  session: '019a619f-3172-7965-90cf-d26bbadd6658',
  event: '019a0a06-9f88-7846-aab4-69782ae9e5e2',
  path: '/Event/_getEventById'
} => { request: '019a61a1-117c-7bd5-9e2d-7f80068f9449' }
Requesting.respond {
  request: '019a61a1-117c-7bd5-9e2d-7f80068f9449',
  event: {
    _id: '019a0a06-9f88-7846-aab4-69782ae9e5e2',
    organizer: '019a0427-0b08-7b94-90ca-0c727c6f3a69',
    name: 'test',
    date: 2025-10-22T16:00:00.000Z,
    duration: 60,
    location: 'test',
    description: 'test...',
    status: 'completed'
  }
} => { request: '019a61a1-117c-7bd5-9e2d-7f80068f9449' }
[Requesting] Received request for path: /Event/_getEventById
Requesting.request {
  session: '019a619f-3172-7965-90cf-d26bbadd6658',
  event: '019a0a06-9f88-7846-aab4-69782ae9e5e2',
  path: '/Event/_getEventById'
} => { request: '019a61a1-1332-79c8-bfa1-2ef1cab560f6' }
Requesting.respond {
  request: '019a61a1-1332-79c8-bfa1-2ef1cab560f6',
  event: {
    _id: '019a0a06-9f88-7846-aab4-69782ae9e5e2',
    organizer: '019a0427-0b08-7b94-90ca-0c727c6f3a69',
    name: 'test',
    date: 2025-10-22T16:00:00.000Z,
    duration: 60,
    location: 'test',
    description: 'test...',
    status: 'completed'
  }
} => { request: '019a61a1-1332-79c8-bfa1-2ef1cab560f6' }
[Requesting] Received request for path: /Event/_getEventById
Requesting.request {
  session: '019a619f-3172-7965-90cf-d26bbadd6658',
  event: '019a27b1-724b-7741-ac95-ae204782cb2e',
  path: '/Event/_getEventById'
} => { request: '019a61a1-14ed-788b-ad10-83918f394683' }
Requesting.respond {
  request: '019a61a1-14ed-788b-ad10-83918f394683',
  event: {
    _id: '019a27b1-724b-7741-ac95-ae204782cb2e',
    organizer: '019a0427-0b08-7b94-90ca-0c727c6f3a69',
    name: 'Boston Fall Food Festival',
    date: 2025-11-01T16:00:00.000Z,
    duration: 180,
    location: 'Boston',
    description: 'Sample dishes from over 50 local restaurants and food trucks celebrating seasonal flavors.',
    status: 'completed'
  }
} => { request: '019a61a1-14ed-788b-ad10-83918f394683' }
[Requesting] Received request for path: /UserInterest/addPersonalInterest
Requesting.request {
  session: '019a619f-3172-7965-90cf-d26bbadd6658',
  tag: 'Soccer',
  path: '/UserInterest/addPersonalInterest'
} => { request: '019a61a1-4a3b-72d9-b0a4-202e574fcef1' }
UserInterest.addPersonalInterest { user: '019a0427-0b08-7b94-90ca-0c727c6f3a69', tag: 'Soccer' } => { personalInterest: '019a61a1-4b44-7dae-9311-e3d302d127ad' }
Requesting.respond {
  request: '019a61a1-4a3b-72d9-b0a4-202e574fcef1',
  personalInterest: '019a61a1-4b44-7dae-9311-e3d302d127ad'
} => { request: '019a61a1-4a3b-72d9-b0a4-202e574fcef1' }
[Requesting] Received request for path: /UserInterest/_getItemInterests
[Requesting] Received request for path: /Event/_getEventsByOrganizer
Requesting.request {
  session: '019a619f-3172-7965-90cf-d26bbadd6658',
  path: '/UserInterest/_getItemInterests'
} => { request: '019a61a1-4c9d-74c5-8311-dfbb46dc92df' }
Requesting.request {
  session: '019a619f-3172-7965-90cf-d26bbadd6658',
  organizer: '019a0427-0b08-7b94-90ca-0c727c6f3a69',
  path: '/Event/_getEventsByOrganizer'
} => { request: '019a61a1-4c9f-7051-bfff-2b6d55ecdd8b' }
Requesting.respond {
  request: '019a61a1-4c9d-74c5-8311-dfbb46dc92df',
  results: [
    {
      _id: '019a09e1-3bba-73a0-9952-a7263d3b0c4e',
      user: '019a0427-0b08-7b94-90ca-0c727c6f3a69',
      item: '019a09c2-c849-7225-8763-f8fdfbe9108a'
    },
    {
      _id: '019a09e1-5d2c-7cba-b520-fc894dad5fb8',
      user: '019a0427-0b08-7b94-90ca-0c727c6f3a69',
      item: '019a09de-3772-7a24-8578-2c85fceeb008'
    },
    {
      _id: '019a0a06-bce0-7ad9-97b6-f875bb578438',
      user: '019a0427-0b08-7b94-90ca-0c727c6f3a69',
      item: '019a0a06-9f88-7846-aab4-69782ae9e5e2'
    },
    {
      _id: '019a0a1e-8bd8-7229-8039-00d7ccb7da37',
      user: '019a0427-0b08-7b94-90ca-0c727c6f3a69',
      item: '019a0a1e-7304-7d40-b744-3906f9412adb'
    },
    {
      _id: '019a2284-1e81-7269-94bd-0a468a05f2f4',
      user: '019a0427-0b08-7b94-90ca-0c727c6f3a69',
      item: '019a227d-06db-7fb3-9350-7b420562de68'
    },
    {
      _id: '019a271b-f74b-741c-a629-fbd34071da29',
      user: '019a0427-0b08-7b94-90ca-0c727c6f3a69',
      item: '019a2718-40a6-7b30-a403-a905f48338ef'
    },
    {
      _id: '019a2dec-af43-7f88-98a8-5285f6518fef',
      user: '019a0427-0b08-7b94-90ca-0c727c6f3a69',
      item: '019a27b1-724b-7741-ac95-ae204782cb2e'
    },
    {
      _id: '019a6155-3de4-71cd-b7da-12f8627a0dbf',
      user: '019a0427-0b08-7b94-90ca-0c727c6f3a69',
      item: '019a60ca-6cb4-7e20-85b5-ce13f0f8b227'
    },
    {
      _id: '019a619f-a6ee-7e10-90c8-b4f5d35c41f7',
      user: '019a0427-0b08-7b94-90ca-0c727c6f3a69',
      item: '019a617b-2394-7e75-9630-075fbf76d9a6'
    }
  ]
} => { request: '019a61a1-4c9d-74c5-8311-dfbb46dc92df' }
Requesting.respond {
  request: '019a61a1-4c9f-7051-bfff-2b6d55ecdd8b',
  results: [
    {
      _id: '019a09f9-0d35-7dfa-8056-c8b33dac8f36',
      organizer: '019a0427-0b08-7b94-90ca-0c727c6f3a69',
      name: 'Study Break',
      date: 2025-10-22T03:32:00.000Z,
      duration: 1,
      location: 'Burton-Conner',
      description: 'Take a break from studying and eat snacks!',
      status: 'completed'
    },
    {
      _id: '019a0a06-9f88-7846-aab4-69782ae9e5e2',
      organizer: '019a0427-0b08-7b94-90ca-0c727c6f3a69',
      name: 'test',
      date: 2025-10-22T16:00:00.000Z,
      duration: 60,
      location: 'test',
      description: 'test...',
      status: 'completed'
    },
    {
      _id: '019a0a1e-7304-7d40-b744-3906f9412adb',
      organizer: '019a0427-0b08-7b94-90ca-0c727c6f3a69',
      name: 'testing_history',
      date: 2025-10-22T04:13:00.000Z,
      duration: 1,
      location: 'test',
      description: 'test',
      status: 'completed'
    },
    {
      _id: '019a27b1-724b-7741-ac95-ae204782cb2e',
      organizer: '019a0427-0b08-7b94-90ca-0c727c6f3a69',
      name: 'Boston Fall Food Festival',
      date: 2025-11-01T16:00:00.000Z,
      duration: 180,
      location: 'Boston',
      description: 'Sample dishes from over 50 local restaurants and food trucks celebrating seasonal flavors.',
      status: 'completed'
    },
    {
      _id: '019a27b2-388d-7639-b14d-c251b555ca81',
      organizer: '019a0427-0b08-7b94-90ca-0c727c6f3a69',
      name: 'Sunset Yoga by the Charles',
      date: 2025-11-01T21:00:00.000Z,
      duration: 60,
      location: 'Esplanade Park, Boston, MA',
      description: 'A calming yoga session at sunset for all levels, hosted by local instructors.',
      status: 'completed'
    },
    {
      _id: '019a27b2-e903-701f-80f7-c69986f559ca',
      organizer: '019a0427-0b08-7b94-90ca-0c727c6f3a69',
      name: 'Intro to Digital Illustration',
      date: 2025-11-02T00:00:00.000Z,
      duration: 60,
      location: 'Boston Center for the Arts',
      description: 'A beginner-friendly workshop introducing techniques in digital drawing using Procreate.',
      status: 'completed'
    },
    {
      _id: '019a27b3-7141-75c7-8e2b-9a27f1db7e8d',
      organizer: '019a0427-0b08-7b94-90ca-0c727c6f3a69',
      name: 'Climate Change Policy Panel',
      date: 2025-11-03T22:00:00.000Z,
      duration: 60,
      location: 'Harvard Kennedy School, Cambridge, MA',
      description: 'Experts discuss actionable policy solutions to mitigate climate change.',
      status: 'completed'
    },
    {
      _id: '019a27b4-1b28-7804-a4cb-4630f02ff044',
      organizer: '019a0427-0b08-7b94-90ca-0c727c6f3a69',
      name: 'Film Screening: Future Cities',
      date: 2025-11-07T01:30:00.000Z,
      duration: 60,
      location: 'Coolidge Corner Theatre, Brookline, MA',
      description: 'A documentary exploring the technology shaping the sustainable cities of tomorrow.',
      status: 'completed'
    },
    {
      _id: '019a27b5-1b01-7c15-b048-4ca71e18431e',
      organizer: '019a0427-0b08-7b94-90ca-0c727c6f3a69',
      name: 'Women in Tech Networking Night',
      date: 2025-11-15T23:00:00.000Z,
      duration: 60,
      location: 'HubSpot HQ, Cambridge, MA',
      description: 'An evening to connect women and nonbinary professionals in the Boston tech scene.',
      status: 'upcoming'
    },
    {
      _id: '019a60ca-6cb4-7e20-85b5-ce13f0f8b227',
      organizer: '019a0427-0b08-7b94-90ca-0c727c6f3a69',
      name: 'The Fourth Witch',
      date: 2025-11-08T01:00:00.000Z,
      duration: 120,
      location: 'Paramount Theater',
      description: 'A Macbeth-based play involving a puppet show.',
      status: 'completed'
    },
    {
      _id: '019a617a-0ab4-735f-b7c2-ccbdd38f234f',
      organizer: '019a0427-0b08-7b94-90ca-0c727c6f3a69',
      name: 'Late Night Study Break',
      date: 2025-11-12T22:00:00.000Z,
      duration: 60,
      location: 'Student Center',
      description: 'Take a break from midterms! Stop by the student center for free pizza, games, and trivia. Open to all undergrads — bring your friends and de-stress before exams.',
      status: 'upcoming'
    },
    {
      _id: '019a617a-93cd-7ad2-8860-8ac6834fede0',
      organizer: '019a0427-0b08-7b94-90ca-0c727c6f3a69',
      name: 'Intramural Soccer Finals',
      date: 2025-11-18T00:00:00.000Z,
      duration: 60,
      location: 'Briggs Field',
      description: 'Cheer on your favorite teams as they compete for the intramural championship! Food, prizes, and halftime mini-games included.',
      status: 'upcoming'
    },
    {
      _id: '019a617b-2394-7e75-9630-075fbf76d9a6',
      organizer: '019a0427-0b08-7b94-90ca-0c727c6f3a69',
      name: 'Book Swap',
      date: 2025-11-21T19:00:00.000Z,
      duration: 60,
      location: 'Hayden Library',
      description: 'Bring a book you’ve finished and exchange it for something new! A cozy event with light snacks, discussion tables, and a “blind date with a book” raffle.',
      status: 'upcoming'
    }
  ]
} => { request: '019a61a1-4c9f-7051-bfff-2b6d55ecdd8b' }
[Requesting] Received request for path: /Event/_getEventById
[Requesting] Received request for path: /Event/_getEventById
[Requesting] Received request for path: /Event/_getEventById
[Requesting] Received request for path: /Event/_getEventById
[Requesting] Received request for path: /Event/_getEventById
[Requesting] Received request for path: /Event/_getEventById
[Requesting] Received request for path: /Event/_getEventById
[Requesting] Received request for path: /Event/_getEventById
[Requesting] Received request for path: /Event/_getEventById
Requesting.request {
  session: '019a619f-3172-7965-90cf-d26bbadd6658',
  event: '019a09c2-c849-7225-8763-f8fdfbe9108a',
  path: '/Event/_getEventById'
} => { request: '019a61a1-4ec8-7224-ab62-14fcd4e8d47d' }
Requesting.request {
  session: '019a619f-3172-7965-90cf-d26bbadd6658',
  event: '019a0a1e-7304-7d40-b744-3906f9412adb',
  path: '/Event/_getEventById'
} => { request: '019a61a1-4ec3-76f0-82d2-1da127a2ddf1' }
Requesting.request {
  session: '019a619f-3172-7965-90cf-d26bbadd6658',
  event: '019a0a06-9f88-7846-aab4-69782ae9e5e2',
  path: '/Event/_getEventById'
} => { request: '019a61a1-4ec6-7e31-86bb-bdd1c12e4b4a' }
Requesting.request {
  session: '019a619f-3172-7965-90cf-d26bbadd6658',
  event: '019a09de-3772-7a24-8578-2c85fceeb008',
  path: '/Event/_getEventById'
} => { request: '019a61a1-4ed2-73dd-844e-5ea10699a34e' }
Requesting.request {
  session: '019a619f-3172-7965-90cf-d26bbadd6658',
  event: '019a617b-2394-7e75-9630-075fbf76d9a6',
  path: '/Event/_getEventById'
} => { request: '019a61a1-4ed0-7f60-a840-c9b2d0393fe1' }
Requesting.request {
  session: '019a619f-3172-7965-90cf-d26bbadd6658',
  event: '019a227d-06db-7fb3-9350-7b420562de68',
  path: '/Event/_getEventById'
} => { request: '019a61a1-4ed3-771e-a8cf-4741b5f9239e' }
Requesting.request {
  session: '019a619f-3172-7965-90cf-d26bbadd6658',
  event: '019a2718-40a6-7b30-a403-a905f48338ef',
  path: '/Event/_getEventById'
} => { request: '019a61a1-4ed9-788e-baf3-0b30dacf4e22' }
Requesting.request {
  session: '019a619f-3172-7965-90cf-d26bbadd6658',
  event: '019a27b1-724b-7741-ac95-ae204782cb2e',
  path: '/Event/_getEventById'
} => { request: '019a61a1-4ed8-7060-bd85-b39479f3b4cb' }
Requesting.request {
  session: '019a619f-3172-7965-90cf-d26bbadd6658',
  event: '019a60ca-6cb4-7e20-85b5-ce13f0f8b227',
  path: '/Event/_getEventById'
} => { request: '019a61a1-4ee4-7dd1-b7c2-1b6dd0da478d' }
Requesting.respond { request: '019a61a1-4ec8-7224-ab62-14fcd4e8d47d', event: null } => { request: '019a61a1-4ec8-7224-ab62-14fcd4e8d47d' }
Requesting.respond {
  request: '019a61a1-4ec3-76f0-82d2-1da127a2ddf1',
  event: {
    _id: '019a0a1e-7304-7d40-b744-3906f9412adb',
    organizer: '019a0427-0b08-7b94-90ca-0c727c6f3a69',
    name: 'testing_history',
    date: 2025-10-22T04:13:00.000Z,
    duration: 1,
    location: 'test',
    description: 'test',
    status: 'completed'
  }
} => { request: '019a61a1-4ec3-76f0-82d2-1da127a2ddf1' }
Requesting.respond { request: '019a61a1-4ed3-771e-a8cf-4741b5f9239e', event: null } => { request: '019a61a1-4ed3-771e-a8cf-4741b5f9239e' }
Requesting.respond { request: '019a61a1-4ed2-73dd-844e-5ea10699a34e', event: null } => { request: '019a61a1-4ed2-73dd-844e-5ea10699a34e' }
Requesting.respond {
  request: '019a61a1-4ec6-7e31-86bb-bdd1c12e4b4a',
  event: {
    _id: '019a0a06-9f88-7846-aab4-69782ae9e5e2',
    organizer: '019a0427-0b08-7b94-90ca-0c727c6f3a69',
    name: 'test',
    date: 2025-10-22T16:00:00.000Z,
    duration: 60,
    location: 'test',
    description: 'test...',
    status: 'completed'
  }
} => { request: '019a61a1-4ec6-7e31-86bb-bdd1c12e4b4a' }
Requesting.respond {
  request: '019a61a1-4ed9-788e-baf3-0b30dacf4e22',
  event: {
    _id: '019a2718-40a6-7b30-a403-a905f48338ef',
    organizer: '019a2702-adbc-75ba-931c-c0e72cf707b5',
    name: 'new',
    date: 2025-10-27T21:00:00.000Z,
    duration: 60,
    location: 'test',
    description: 'TEST',
    status: 'completed'
  }
} => { request: '019a61a1-4ed9-788e-baf3-0b30dacf4e22' }
Requesting.respond {
  request: '019a61a1-4ed0-7f60-a840-c9b2d0393fe1',
  event: {
    _id: '019a617b-2394-7e75-9630-075fbf76d9a6',
    organizer: '019a0427-0b08-7b94-90ca-0c727c6f3a69',
    name: 'Book Swap',
    date: 2025-11-21T19:00:00.000Z,
    duration: 60,
    location: 'Hayden Library',
    description: 'Bring a book you’ve finished and exchange it for something new! A cozy event with light snacks, discussion tables, and a “blind date with a book” raffle.',
    status: 'upcoming'
  }
} => { request: '019a61a1-4ed0-7f60-a840-c9b2d0393fe1' }
Requesting.respond {
  request: '019a61a1-4ee4-7dd1-b7c2-1b6dd0da478d',
  event: {
    _id: '019a60ca-6cb4-7e20-85b5-ce13f0f8b227',
    organizer: '019a0427-0b08-7b94-90ca-0c727c6f3a69',
    name: 'The Fourth Witch',
    date: 2025-11-08T01:00:00.000Z,
    duration: 120,
    location: 'Paramount Theater',
    description: 'A Macbeth-based play involving a puppet show.',
    status: 'completed'
  }
} => { request: '019a61a1-4ee4-7dd1-b7c2-1b6dd0da478d' }
Requesting.respond {
  request: '019a61a1-4ed8-7060-bd85-b39479f3b4cb',
  event: {
    _id: '019a27b1-724b-7741-ac95-ae204782cb2e',
    organizer: '019a0427-0b08-7b94-90ca-0c727c6f3a69',
    name: 'Boston Fall Food Festival',
    date: 2025-11-01T16:00:00.000Z,
    duration: 180,
    location: 'Boston',
    description: 'Sample dishes from over 50 local restaurants and food trucks celebrating seasonal flavors.',
    status: 'completed'
  }
} => { request: '019a61a1-4ed8-7060-bd85-b39479f3b4cb' }
[Requesting] Received request for path: /UserInterest/_getPersonalInterests
Requesting.request {
  session: '019a619f-3172-7965-90cf-d26bbadd6658',
  path: '/UserInterest/_getPersonalInterests'
} => { request: '019a61a1-5226-7788-b640-a1ddb990770c' }
Requesting.respond {
  request: '019a61a1-5226-7788-b640-a1ddb990770c',
  results: [
    {
      _id: '019a2876-479f-7587-a931-2863c4c428c5',
      user: '019a0427-0b08-7b94-90ca-0c727c6f3a69',
      tag: 'Recycling'
    },
    {
      _id: '019a60af-d8b6-71cb-bca4-86426e4fc7b3',
      user: '019a0427-0b08-7b94-90ca-0c727c6f3a69',
      tag: 'Technology'
    },
    {
      _id: '019a6185-c288-778c-8560-595170b9219e',
      user: '019a0427-0b08-7b94-90ca-0c727c6f3a69',
      tag: 'Book'
    },
    {
      _id: '019a61a1-4b44-7dae-9311-e3d302d127ad',
      user: '019a0427-0b08-7b94-90ca-0c727c6f3a69',
      tag: 'Soccer'
    }
  ]
} => { request: '019a61a1-5226-7788-b640-a1ddb990770c' }
[Requesting] Received request for path: /Event/_getEventsByRecommendationContext
Requesting.request {
  session: '019a619f-3172-7965-90cf-d26bbadd6658',
  filters: 'Recycling,Technology,Book,Soccer',
  priorities: 'upcoming',
  path: '/Event/_getEventsByRecommendationContext'
} => { request: '019a61a1-544f-7e88-a29c-4492fee8dda0' }
🤖 Requesting AI-augmented recommendations from LLM...
✅ Received response from LLM!
🤖 RAW LLM RESPONSE
======================
```json
{
  "recommendations": [
    {
      "name": "Women in Tech Networking Night",
      "reason": "This event aligns with the 'Technology' filter and is upcoming."
    },
    {
      "name": "Intramural Soccer Finals",
      "reason": "This event matches the 'Soccer' filter and is upcoming."
    },
    {
      "name": "Book Swap",
      "reason": "This event matches the 'Book' filter and is upcoming."
    }
  ]
}
```
======================
📝 Applying LLM recommendations...
✅ Recommended "Women in Tech Networking Night" (This event aligns with the 'Technology' filter and is upcoming.)
✅ Recommended "Intramural Soccer Finals" (This event matches the 'Soccer' filter and is upcoming.)
✅ Recommended "Book Swap" (This event matches the 'Book' filter and is upcoming.)
Requesting.respond {
  request: '019a61a1-544f-7e88-a29c-4492fee8dda0',
  results: [
    {
      _id: '019a27b5-1b01-7c15-b048-4ca71e18431e',
      organizer: '019a0427-0b08-7b94-90ca-0c727c6f3a69',
      name: 'Women in Tech Networking Night',
      date: 2025-11-15T23:00:00.000Z,
      duration: 60,
      location: 'HubSpot HQ, Cambridge, MA',
      description: 'An evening to connect women and nonbinary professionals in the Boston tech scene.',
      status: 'upcoming'
    },
    {
      _id: '019a617a-93cd-7ad2-8860-8ac6834fede0',
      organizer: '019a0427-0b08-7b94-90ca-0c727c6f3a69',
      name: 'Intramural Soccer Finals',
      date: 2025-11-18T00:00:00.000Z,
      duration: 60,
      location: 'Briggs Field',
      description: 'Cheer on your favorite teams as they compete for the intramural championship! Food, prizes, and halftime mini-games included.',
      status: 'upcoming'
    },
    {
      _id: '019a617b-2394-7e75-9630-075fbf76d9a6',
      organizer: '019a0427-0b08-7b94-90ca-0c727c6f3a69',
      name: 'Book Swap',
      date: 2025-11-21T19:00:00.000Z,
      duration: 60,
      location: 'Hayden Library',
      description: 'Bring a book you’ve finished and exchange it for something new! A cozy event with light snacks, discussion tables, and a “blind date with a book” raffle.',
      status: 'upcoming'
    }
  ],
  error: null
} => { request: '019a61a1-544f-7e88-a29c-4492fee8dda0' }
[Requesting] Received request for path: /Event/_getEventsByStatus
Requesting.request {
  session: '019a619f-3172-7965-90cf-d26bbadd6658',
  status: 'upcoming',
  path: '/Event/_getEventsByStatus'
} => { request: '019a61a1-593f-70a1-81df-3afc73e30971' }
Requesting.respond {
  request: '019a61a1-593f-70a1-81df-3afc73e30971',
  results: [
    {
      _id: '019a27b5-1b01-7c15-b048-4ca71e18431e',
      organizer: '019a0427-0b08-7b94-90ca-0c727c6f3a69',
      name: 'Women in Tech Networking Night',
      date: 2025-11-15T23:00:00.000Z,
      duration: 60,
      location: 'HubSpot HQ, Cambridge, MA',
      description: 'An evening to connect women and nonbinary professionals in the Boston tech scene.',
      status: 'upcoming'
    },
    {
      _id: '019a617a-0ab4-735f-b7c2-ccbdd38f234f',
      organizer: '019a0427-0b08-7b94-90ca-0c727c6f3a69',
      name: 'Late Night Study Break',
      date: 2025-11-12T22:00:00.000Z,
      duration: 60,
      location: 'Student Center',
      description: 'Take a break from midterms! Stop by the student center for free pizza, games, and trivia. Open to all undergrads — bring your friends and de-stress before exams.',
      status: 'upcoming'
    },
    {
      _id: '019a617a-93cd-7ad2-8860-8ac6834fede0',
      organizer: '019a0427-0b08-7b94-90ca-0c727c6f3a69',
      name: 'Intramural Soccer Finals',
      date: 2025-11-18T00:00:00.000Z,
      duration: 60,
      location: 'Briggs Field',
      description: 'Cheer on your favorite teams as they compete for the intramural championship! Food, prizes, and halftime mini-games included.',
      status: 'upcoming'
    },
    {
      _id: '019a617b-2394-7e75-9630-075fbf76d9a6',
      organizer: '019a0427-0b08-7b94-90ca-0c727c6f3a69',
      name: 'Book Swap',
      date: 2025-11-21T19:00:00.000Z,
      duration: 60,
      location: 'Hayden Library',
      description: 'Bring a book you’ve finished and exchange it for something new! A cozy event with light snacks, discussion tables, and a “blind date with a book” raffle.',
      status: 'upcoming'
    }
  ]
} => { request: '019a61a1-593f-70a1-81df-3afc73e30971' }
[Requesting] Received request for path: /UserInterest/_getUsersInterestedInItems
[Requesting] Received request for path: /UserInterest/_getUsersInterestedInItems
[Requesting] Received request for path: /UserInterest/_getUsersInterestedInItems
[Requesting] Received request for path: /UserInterest/_getUsersInterestedInItems
Requesting.request {
  session: '019a619f-3172-7965-90cf-d26bbadd6658',
  item: '019a617a-0ab4-735f-b7c2-ccbdd38f234f',
  path: '/UserInterest/_getUsersInterestedInItems'
} => { request: '019a61a1-5c61-7d22-8229-daf7a888684e' }
Requesting.request {
  session: '019a619f-3172-7965-90cf-d26bbadd6658',
  item: '019a617b-2394-7e75-9630-075fbf76d9a6',
  path: '/UserInterest/_getUsersInterestedInItems'
} => { request: '019a61a1-5c6b-7c4b-81d4-10b2f3123dc5' }
Requesting.request {
  session: '019a619f-3172-7965-90cf-d26bbadd6658',
  item: '019a617a-93cd-7ad2-8860-8ac6834fede0',
  path: '/UserInterest/_getUsersInterestedInItems'
} => { request: '019a61a1-5c70-71fa-b395-16791359c8c1' }
Requesting.request {
  session: '019a619f-3172-7965-90cf-d26bbadd6658',
  item: '019a27b5-1b01-7c15-b048-4ca71e18431e',
  path: '/UserInterest/_getUsersInterestedInItems'
} => { request: '019a61a1-5c77-74b3-ae3e-004e11922fbf' }
Requesting.respond { request: '019a61a1-5c61-7d22-8229-daf7a888684e', results: [] } => { request: '019a61a1-5c61-7d22-8229-daf7a888684e' }
Requesting.respond {
  request: '019a61a1-5c6b-7c4b-81d4-10b2f3123dc5',
  results: [ { user: '019a0427-0b08-7b94-90ca-0c727c6f3a69' } ]
} => { request: '019a61a1-5c6b-7c4b-81d4-10b2f3123dc5' }
Requesting.respond { request: '019a61a1-5c70-71fa-b395-16791359c8c1', results: [] } => { request: '019a61a1-5c70-71fa-b395-16791359c8c1' }
Requesting.respond { request: '019a61a1-5c77-74b3-ae3e-004e11922fbf', results: [] } => { request: '019a61a1-5c77-74b3-ae3e-004e11922fbf' }
[Requesting] Received request for path: /UserInterest/_getItemInterests
Requesting.request {
  session: '019a619f-3172-7965-90cf-d26bbadd6658',
  path: '/UserInterest/_getItemInterests'
} => { request: '019a61a1-5e26-7a4f-90d0-d1160ac194ba' }
Requesting.respond {
  request: '019a61a1-5e26-7a4f-90d0-d1160ac194ba',
  results: [
    {
      _id: '019a09e1-3bba-73a0-9952-a7263d3b0c4e',
      user: '019a0427-0b08-7b94-90ca-0c727c6f3a69',
      item: '019a09c2-c849-7225-8763-f8fdfbe9108a'
    },
    {
      _id: '019a09e1-5d2c-7cba-b520-fc894dad5fb8',
      user: '019a0427-0b08-7b94-90ca-0c727c6f3a69',
      item: '019a09de-3772-7a24-8578-2c85fceeb008'
    },
    {
      _id: '019a0a06-bce0-7ad9-97b6-f875bb578438',
      user: '019a0427-0b08-7b94-90ca-0c727c6f3a69',
      item: '019a0a06-9f88-7846-aab4-69782ae9e5e2'
    },
    {
      _id: '019a0a1e-8bd8-7229-8039-00d7ccb7da37',
      user: '019a0427-0b08-7b94-90ca-0c727c6f3a69',
      item: '019a0a1e-7304-7d40-b744-3906f9412adb'
    },
    {
      _id: '019a2284-1e81-7269-94bd-0a468a05f2f4',
      user: '019a0427-0b08-7b94-90ca-0c727c6f3a69',
      item: '019a227d-06db-7fb3-9350-7b420562de68'
    },
    {
      _id: '019a271b-f74b-741c-a629-fbd34071da29',
      user: '019a0427-0b08-7b94-90ca-0c727c6f3a69',
      item: '019a2718-40a6-7b30-a403-a905f48338ef'
    },
    {
      _id: '019a2dec-af43-7f88-98a8-5285f6518fef',
      user: '019a0427-0b08-7b94-90ca-0c727c6f3a69',
      item: '019a27b1-724b-7741-ac95-ae204782cb2e'
    },
    {
      _id: '019a6155-3de4-71cd-b7da-12f8627a0dbf',
      user: '019a0427-0b08-7b94-90ca-0c727c6f3a69',
      item: '019a60ca-6cb4-7e20-85b5-ce13f0f8b227'
    },
    {
      _id: '019a619f-a6ee-7e10-90c8-b4f5d35c41f7',
      user: '019a0427-0b08-7b94-90ca-0c727c6f3a69',
      item: '019a617b-2394-7e75-9630-075fbf76d9a6'
    }
  ]
} => { request: '019a61a1-5e26-7a4f-90d0-d1160ac194ba' }
[Requesting] Received request for path: /Event/_getEventById
Requesting.request {
  session: '019a619f-3172-7965-90cf-d26bbadd6658',
  event: '019a0a06-9f88-7846-aab4-69782ae9e5e2',
  path: '/Event/_getEventById'
} => { request: '019a61a1-6098-7e3e-aeef-c48b58367ef7' }
Requesting.respond {
  request: '019a61a1-6098-7e3e-aeef-c48b58367ef7',
  event: {
    _id: '019a0a06-9f88-7846-aab4-69782ae9e5e2',
    organizer: '019a0427-0b08-7b94-90ca-0c727c6f3a69',
    name: 'test',
    date: 2025-10-22T16:00:00.000Z,
    duration: 60,
    location: 'test',
    description: 'test...',
    status: 'completed'
  }
} => { request: '019a61a1-6098-7e3e-aeef-c48b58367ef7' }
[Requesting] Received request for path: /logout
Requesting.request { session: '019a619f-3172-7965-90cf-d26bbadd6658', path: '/logout' } => { request: '019a61a1-9274-7553-aed4-31fd3ab5bdb4' }
Sessioning.delete { session: '019a619f-3172-7965-90cf-d26bbadd6658' } => {}
Requesting.respond {
  request: '019a61a1-9274-7553-aed4-31fd3ab5bdb4',
  status: 'logged_out'
} => { request: '019a61a1-9274-7553-aed4-31fd3ab5bdb4' }
```