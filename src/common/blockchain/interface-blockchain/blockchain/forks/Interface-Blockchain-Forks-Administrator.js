import InterfaceBlockchainFork from './Interface-Blockchain-Fork'

/**
 * Blockchain contains a chain of blocks based on Proof of Work
 */

class InterfaceBlockchainForksAdministrator {


    constructor (blockchain, forkClass){

        this.blockchain = blockchain;
        this.forks = [];

        this.forksId = 0;

        this.forkClass = forkClass || InterfaceBlockchainFork;

        this.socketsProcessing = [];
    }

    createNewFork(sockets, forkStartingHeight, forkChainStartingPoint, forkChainLength, header){

        if (!Array.isArray(sockets)) sockets = [sockets];

        let fork;

        if (this.findForkBySockets(sockets) !== null) return null;

        if (this.findForkByHeader(header) !== null) return null;

        fork = new this.forkClass( this.blockchain, this.forksId++, sockets, forkStartingHeight, forkChainStartingPoint, forkChainLength, header );

        this.forks.push(fork);

        return fork;
    }

    getLargestFork(){
        let maxFork = null;
        let maxForkLength = 0;

        for (let i=0; i<this.forks.length; i++)
            if (this.forks[i].forkChainLength > maxForkLength){
                maxForkLength = this.forks[i].forkChainLength;
                maxFork = this.forks[i];
            }

        return maxFork;
    }

    /**
     * Find a fork by a socket
     * @param sockets
     * @returns {*}
     */

    findForkBySockets(sockets){

        if (!Array.isArray(sockets)) sockets = [sockets];

        for (let i=0; i<sockets.length; i++){

            for (let j=0; j<this.forks.length; j++) {

                for (let q=0; q<this.forks[j].sockets.length; q++)

                    if ( this.forks[j].sockets[q].node.sckAddress === sockets[i].node.sckAddress ||
                         this.forks[j].sockets[q].node.sckAddress.matchAddress(sockets[i].node.sckAddress) )

                        return this.forks[j];
            }
        }

        return null;
    }

    /**
     * Find a fork by a Header (block header)
     * @param header
     * @returns {*}
     */
    findForkByHeader(header){

        if (header === null || header === undefined) return null;
        if (header.hash === null || header.hash === undefined) return null;

        for (let i=0; i<this.forks.length; i++)
            if ( this.forks[i].forkHeader !== null && this.forks[i].forkHeader.hash !== undefined && this.forks[i].forkHeader.hash !== null && (this.forks[i].forkHeader === header || this.forks[i].forkHeader.hash.equals( header.hash )) )
                return this.forks[i];

        return null;
    }

    deleteFork(fork){

        if (fork === undefined) return false;

        for (let i=0; i<this.forks.length; i++)
            if (this.forks[i] === fork || this.forks[i].forkId === fork) {
                this.forks.splice(i,1);
                return true;
            }
        return false;
    }






    findSocketProcessing(socket){

        for (let i=0; i<this.socketsProcessing.length; i++)
            if (this.socketsProcessing[i].socket === socket || this.socketsProcessing[i].socket.node.sckAddress.matchAddress(socket.node.sckAddress) )
                return i;

        return null;
    }

    getSocketProcessing(socket){
        let index = this.findSocketProcessing(socket);
        if (index === null) return null;
        else return this.socketsProcessing[index];
    }

    deleteSocketProcessing(socket){

        let index = this.findSocketProcessing(socket);

        if (index !== null) {
            this.socketsProcessing.splice(index, 1);
            return true;
        }

        return false;

    }

    addSocketProcessing(socket, forkChainLength){

        if (this.findSocketProcessing(socket) === null){
            this.socketsProcessing.push({ socket: socket, forkChainLength: forkChainLength, forkChainLengthToDo: -1  })
            return this.socketsProcessing[this.socketsProcessing.length-1];
        }

        return null;
    }

    updateSocketProcessingNewForkLength(processingSocket, forkChainLengthToDo ){

        if (processingSocket === null) return null;

        if (processingSocket.forkChainLength > forkChainLengthToDo) return; //nothing to update

        processingSocket.forkChainLengthToDo = Math.max(forkChainLengthToDo, processingSocket.forkChainLengthToDo);

        return processingSocket;
    }

}

export default InterfaceBlockchainForksAdministrator;