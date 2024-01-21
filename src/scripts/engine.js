//Para chamar o áudio de fundo
const bgm = document.getElementById("bgm");

const state = {
    score: {
        playerScore: 0,
        computerScore: 0,
        scoreBox: document.getElementById("score_points") //O id do placar
    },
    //Propriedades para quando quiser capturar ids
    cardSprites: {
        avatar: document.getElementById("card-image"),
        name: document.getElementById("card-name"),
        type: document.getElementById("card-type"),
    },
    //Propriedades para quando quiser capturar esses ids
    fieldCards: {
        player: document.getElementById("player-field-card"),
        computer: document.getElementById("computer-field-card"),

    },

    playerSides: {
        // Propriedades com o mesmo id das img que estão da div card-versus__container
        player1: "player-cards",
        player1BOX: document.querySelector("#player-cards"), // Selecionar o id computer-cards
        computer: "computer-cards",
        computerBOX: document.querySelector("#computer-cards") // Selecionar o id computer-cards
    },

    actions: {
        button: document.getElementById("next-duel")
    }
};

//Parte fixa do caminho das imagens
const pathImages = "./src/assets/icons/";


// Para cada carta há um objeto com o id da carta, nome, tipo,a parte 
// dinâmica do caminho da imagem, id de quem perde e ganha da carta.
//Objetos assim são tipos de enuns
const cardData = [
    {
        id: 0,
        name: "Blue Eyes White Dragon",
        type: "Paper",
        img: `${pathImages}dragon.png`,
        WinOf: [1],
        LoseOf: [2]
    },
    {
        id: 1,
        name: "Mago Magician",
        type: "Rock",
        img: `${pathImages}magician.png`,
        WinOf: [2],
        LoseOf: [0]
    },
    {
        id: 2,
        name: "Exodia",
        type: "Scissors",
        img: `${pathImages}exodia.png`,
        WinOf: [0],
        LoseOf: [1]
    }
]

//Para randomizar os cards
async function getRandomCardId() {
    //Para arredondar pra baixo o número aleatório, de no máximo, a quantidade de objetos do cardData 
    const randomIndex = Math.floor(Math.random() * cardData.length);
    //Para retornar o id aleatório dos objetos no cardData
    return cardData[randomIndex].id;
};

async function createCardImage(IdCard, fieldSide) {
    //Para criar um img dinamicamente
    const cardImage = document.createElement("img");

    //Para setar um artributo ao img
    cardImage.setAttribute("height", "100px");
    //Para atribuir o caminho dessa imagem
    cardImage.setAttribute("src", "./src/assets/icons/card-back.png");
    //Para salvar o id da carta no html, em uma variável "data"
    cardImage.setAttribute("data-id", IdCard);
    //Para adicionar a classe card.
    cardImage.classList.add("card");

    //Para comparar se lado do campo é igual ao do jogador. Se for, é
    //adicionado um evento de click dele, fazendo com que ele fique interável
    if (fieldSide === state.playerSides.player1) {
        cardImage.addEventListener("click", () => {
            //Para recuperar o id que está no "data-id", atribuindo ele ao cardImage
            setCardsField(cardImage.getAttribute("data-id"))
        });

        //Ao passar o mouse em cima de uma carta vai aparecer a carta no lado esquerdo,
        //mas só do jogador 
        cardImage.addEventListener("mouseover", () => {
            drawSelectCard(IdCard)
        });

    };

    return cardImage;
};

//Faz a chamada de várias funções
async function setCardsField(cardId) {

    //Para remover as cartas que não estão ativas na rodada, deixando, somente
    //as duas que estão duelando (do meio)
    await removeAllCardsImages();

    //Para chamar um id aleatório das cartas do computador
    let computerCardId = await getRandomCardId();

    //Chamada para bloquear as cartas
    await showHiddenCardFieldsImages(true);

    //Chamada para limpar as informações da carta no campo da esquerda
    await hiddenCardDetails();

    //Para visualizar a carta no campo de batalha
    await drawCardsInField(cardId, computerCardId);

    // Para dar o resultado do duelo
    let duelResults = await checkDuelResults(cardId, computerCardId);

    // // Chamada para mostrar a pontuação 
    await updateScore();
    // // Chamada para mostrar o buttton, de acordo com o resultado 
    await drawButton(duelResults);

};

async function drawCardsInField(cardId, computerCardId) {
    //Para setar o src da imagem da carta do player
    state.fieldCards.player.src = cardData[cardId].img;

    //Para setar o src da imagem da carta do computador
    state.fieldCards.computer.src = cardData[computerCardId].img;
}

async function showHiddenCardFieldsImages(value) {
    if (value === true) {
        //para atribuir um display block às cartas do jogador
        state.fieldCards.player.style.display = "block";
        //para atribuir um display block às cartas do computador
        state.fieldCards.computer.style.display = "block";
    }

    if (value === false) {
        //para atribuir um display block às cartas do jogador
        state.fieldCards.player.style.display = "none";
        //para atribuir um display block às cartas do computador
        state.fieldCards.computer.style.display = "none";
    }
}

async function hiddenCardDetails() {
    //Para limpar as informações da carta no campo da esquerda
    state.cardSprites.avatar.src = "";
    state.cardSprites.name.innerText = "";
    state.cardSprites.type.innerText = "";
}

//Para mostrar o buttton, de acordo com o resultado 
async function drawButton(text) {
    //Para mudar o texto do botão
    state.actions.button.innerText = text;
    state.actions.button.style.display = "block" //Para exibir o botão que estava oculto
};

//Para mostrar a pontução na tela
async function updateScore() {
    state.score.scoreBox.innerText = `Win: ${state.score.playerScore} |
     Lose: ${state.score.computerScore}`
};

// Para comparar quem ganhou 
async function checkDuelResults(playerCardId, ComputerCardId) {

    let duelResults = "Empate";

    //A carta do jogador
    let playerCard = cardData[playerCardId];

    //Para verificar se o jogador ganhou. o WinOf é a propriedade que
    //tem o id da carta, do computador, que é derrotada pela carta do jogador
    if (playerCard.WinOf.includes(ComputerCardId)) {

        duelResults = "Ganhou";

        //Chamada da função dos audios
        await playAudio("win");

        //Para aumentar a pontuação
        state.score.playerScore++;

    };

    //Para verificar se o computador ganhou.
    if (playerCard.LoseOf.includes(ComputerCardId)) {

        duelResults = "Perdeu";

        //Chamada da função do áudio de derrota
        await playAudio("lose");

        state.score.computerScore++;
    };
    //Para pausar a música
    bgm.pause();

    return duelResults
}

//Função para remover as cartas no campo de espera
async function removeAllCardsImages() {

    let { computerBOX, player1BOX } = state.playerSides; //Para pegar o id computer-cards e player-cards

    //Para pegar todos as tags de img da let cards
    let imgElements = computerBOX.querySelectorAll("img");

    //Para remover as tags de imagem
    imgElements.forEach((img) => img.remove());

    //Para pegar todos as tags de img da let cards do jogador
    imgElements = player1BOX.querySelectorAll("img");

    //Para remover as tags de imagem das cards do jogador
    imgElements.forEach((img) => img.remove());
};

async function drawSelectCard(index) {
    //Para setar, dinamicamente, o src da imagem do avatar (setado no state...), atribuindo o que
    // está na propriedade img do objeto cardData, de acordo com o index aleatório
    state.cardSprites.avatar.src = cardData[index].img;
    // Para definir o texto interno do nome, que vai ser do cardData[index].name;
    state.cardSprites.name.innerText = cardData[index].name;
    // Para definir o texto interno do tipo, que vai ser do cardData[index].name;
    state.cardSprites.type.innerText = "Attribute: " + cardData[index].type;

}

//Para dar as cartas aleatoriamente, tanto pro jogador, quanto pro computador.
//O fieldSide é o lado do campo que será distribuídas as cartas. Pode ser tanto o 
//computer-field, quanto o player-field
async function drawCards(cardNumbers, fieldSide) {
    for (let i = 0; i < cardNumbers; i++) {

        //Para dar o id aliatório de uma carta
        const randomIdCard = await getRandomCardId();

        const cardImage = await createCardImage(randomIdCard, fieldSide);

        //Para pendurar o cardImage dentro do fieldSide
        document.getElementById(fieldSide).appendChild(cardImage);
    }
};

// Para resetar o jogo. A chamada dessa função foi passada no onClick do button, no html
async function resetDuel() {
    state.cardSprites.avatar.src = "";
    state.actions.button.style.display = "none";

    start()
};

//Para os áudios. O "status é o parâmetro pra saber se o jogador ganhou ou perdeu",
//que será o nome do áudio (win ou lose)
async function playAudio(status) {
    const audio = new Audio(`./src/assets/audios/${status}.wav`);
    audio.play();
}

function start() {

    //Chamada para debloquear as cartas
    showHiddenCardFieldsImages(false)

    // O player1 ou computer são os que serão fieldSide
    drawCards(5, state.playerSides.player1);
    drawCards(5, state.playerSides.computer);
    //Para tocar a música de fundo
    bgm.play();
}
start();