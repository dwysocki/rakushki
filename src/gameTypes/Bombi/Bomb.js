function Bomb(color, blastRad, explosionTurn, shellArray, bombCoord) {
    this.color = color;
    this.blastRad = blastRad;
    this.explosionTurn = explosionTurn;
    this.shellArray = shellArray;
    this.bombCoord = bombCoord;
    this.isActive = true;
    this.cornerShell = shellArray[0];
}
