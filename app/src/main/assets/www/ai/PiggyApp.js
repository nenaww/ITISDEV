class PiggyApp {

    constructor(parent = document.body) {

        this.parent = parent;

        this.manager = new PiggyChatManager();

        this.overlay = new PiggyOverlay(

            async message => {

                try {

                    const result =
                        await this.manager.ask(message);

                    this.overlay.receivePiggyMessage(

                        result.text

                    );

                }

                catch (error) {

                    console.error(

                        "Piggy AI:",

                        error

                    );

                    this.overlay.receivePiggyMessage(

                        "Sorry, something went wrong."

                    );

                }

            }

        );

        this.button = new PiggyButton(

            () => this.overlay.open()

        );

    }

    initialize() {

        this.button.render(this.parent);

        this.overlay.render(this.parent);

    }

}

window.PiggyApp = PiggyApp;