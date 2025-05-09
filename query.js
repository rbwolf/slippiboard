const API_URL = 'https://gql-gateway-2-dot-slippi.uc.r.appspot.com/graphql';

const GRAPHQL_QUERY = `
    fragment profileFieldsV2 on NetplayProfileV2 {
      id
      ratingOrdinal
      ratingUpdateCount
      wins
      losses
      dailyGlobalPlacement
      dailyRegionalPlacement
      continent
      characters {
        character
        gameCount
        __typename
      }
      __typename
    }

    fragment userProfilePage on User {
      fbUid
      displayName
      connectCode {
        code
        __typename
      }
      status
      activeSubscription {
        level
        hasGiftSub
        __typename
      }
      rankedNetplayProfile {
        ...profileFieldsV2
        __typename
      }
       rankedNetplayProfileHistory {
         ...profileFieldsV2
         season {
           id
           startedAt
           endedAt
           name
           status
           __typename
         }
         __typename
       }
      __typename
    }

    query UserProfilePageQuery($cc: String!, $uid: String!) {
      getUser(fbUid: $uid) { # This often returns null if only CC is known initially
        ...userProfilePage
        __typename
      }
      getConnectCode(code: $cc) {
        user {
          ...userProfilePage
          __typename
        }
        __typename
      }
    }`;


export async function fetchPlayerData(connectCode) {
  // The API expects both 'cc' and 'uid' in variables.
  // We'll use the connectCode for both as per the example structure.
  const variables = {
    cc: connectCode,
    uid: connectCode // Assuming uid can be the same as cc for this query context
  };

  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        operationName: 'UserProfilePageQuery',
        query: GRAPHQL_QUERY,
        variables: variables,
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const jsonResponse = await response.json();

    if (jsonResponse.errors) {
      console.error('GraphQL Errors:', jsonResponse.errors);
      throw new Error(jsonResponse.errors.map(e => e.message).join(', '));
    }

    const user = jsonResponse.data?.getConnectCode?.user;

    if (!user) {
      throw new Error('Player data not found in response.');
    }

    return {
      name: user.displayName || 'N/A',
      wins: user.rankedNetplayProfile?.wins ?? 0,
      losses: user.rankedNetplayProfile?.losses ?? 0,
      rating: user.rankedNetplayProfile?.ratingOrdinal ?? 0,
      characters: user.rankedNetplayProfile?.characters || [],
      connectCode: connectCode // Keep for reference or display
    };

  } catch (error) {
    console.error(`Error fetching data for ${connectCode}:`, error);
    return { error: true, connectCode: connectCode, message: error.message };
  }
}
