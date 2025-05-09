import { fetchPlayerData } from './query.js'

document.addEventListener('DOMContentLoaded', () => {
  // Add your friends' connect codes here
  const PLAYER_CONNECT_CODES = ["FOOL#941", "COLD#415", "HATY#438", "R#1"]; // Example codes

  const playerCardContainer = document.getElementById('player-cards-container');

  function createPlayerCard(playerData) {
    const card = document.createElement('article');
    card.classList.add('player-card');

    if (playerData.error) {
      card.classList.add('error');
      card.innerHTML = `
                <h2>Error for ${playerData.connectCode}</h2>
                <p>Could not fetch player data.</p>
                <p><small>${playerData.message}</small></p>
            `;
      return card;
    }

    const characterListItems = playerData.characters.map(char =>
      `<li>${char.character}: ${char.gameCount} games</li>`
    ).join('');

    card.innerHTML = `
            <h2>${playerData.name} (${playerData.connectCode})</h2>
            <p><strong>Rank (Rating):</strong> ${playerData.rating ? playerData.rating.toFixed(2) : 'N/A'}</p>
            <p><strong>Wins:</strong> ${playerData.wins}</p>
            <p><strong>Losses:</strong> ${playerData.losses}</p>
            <p><strong>Characters:</strong></p>
            ${playerData.characters.length > 0 ? `<ul class="characters-list">${characterListItems}</ul>` : '<p>No character data available.</p>'}
        `;
    return card;
  }

  async function initApp() {
    if (!playerCardContainer) {
      console.error('Player card container not found!');
      return;
    }

    const playerData = await Promise.all(
      PLAYER_CONNECT_CODES.map(async (code) => await fetchPlayerData(code)
      ));
    playerData
      .sort((a, b) =>
         (b.wins + b.losses) - (a.wins + a.losses)
      ).forEach(data => {
        console.log(data)
        const cardElement = createPlayerCard(data);
        playerCardContainer.appendChild(cardElement);
      });
  }

  initApp();
});
