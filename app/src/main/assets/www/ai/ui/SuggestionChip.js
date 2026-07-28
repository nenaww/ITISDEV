class SuggestionChip {

    constructor(

        text,

        onClick

    ) {

        this.text = text;

        this.onClick = onClick;

    }

    render() {

        const chip =

            document.createElement("button");

        chip.className =

            "piggy-chip";

        chip.innerText =

            this.text;

        chip.onclick =

            () => this.onClick(

                this.text

            );

        return chip;

    }

}

window.SuggestionChip = SuggestionChip;