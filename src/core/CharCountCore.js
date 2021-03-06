import State from '../helpers/CharCountState';
// import * as Errors from '../helpers/CharCountErrors';

/**
 * Counts characters, so you don't have to!
 */
export default class CharCountCore {

    /**
     * constructor
     * @param  {object} Config to initialise the class with
     * @return {void}
     */
    constructor({

        // Core
        // -----

        element = null,


        // Config
        // -----

        warningThreshold: warning = 25,
        dangerThreshold: danger = 10,
        expendedThreshold: limit = 100,
        // Threshold values
        // TODO: Potentially look at percentages as well as fixed figures?

        counterClass = 'cc-count',
        // DOM interaction classes

        emptyClass: classStateIsEmpty = 'cc-is-empty',
        fineClass: classStateIsFine = 'cc-is-fine',
        warningClass: classStateIsWarning = 'cc-is-warning',
        dangerClass: classStateIsDanger = 'cc-is-danger',
        expendedClass: classStateIsExpended = 'cc-is-expended',
        // DOM state classes


        // Callbacks
        // -----

        onFieldEmpty = (field, remaining) => {},
        // Fired when a fields text count is zero; not entirely sure on its continued usefulness

        onFieldFine = (field, remaining) => {},
        // Fired when a fields text remaining count is a-okay, after coming from another state

        onFieldWarning = (field, remaining) => {},
        // Fired when the desired warning threshold is reached

        onFieldDanger = (field, remaining) => {},
        // Fired when the desired danger threshold is reached

        onFieldExpended = (field, remaining) => {},
        // Fired when the limit is all used up!

    } = {}) {

        if (element === null)
            console.error('Error initialising element!');

        this.element = element;
        // Element that the class instantiation is in reference to

        limit = (this.element.hasAttribute('maxlength')
            ? parseInt(this.element.getAttribute('maxlength'))
            : limit);
        // If there is a max length applied to the element, use that instead

        this.states = {
            empty: new State(0, classStateIsEmpty),
            fine: new State(limit, classStateIsFine),
            warning: new State(warning, classStateIsWarning),
            danger: new State(danger, classStateIsDanger),
            expended: new State(0, classStateIsExpended)
        };
        // Define states

        this.activeState = this.states.empty;
        this.inputLength = this.element.value.length;
        this.remainingCharacters = limit;
        // Store current state properties

        this.counterClass = counterClass;
        this.counter = this.createElementCounter();
        // Setup DOM counter
        // TODO: Allow for this to be situated at a custom location

        this.onFieldEmpty = onFieldEmpty;
        this.onFieldFine = onFieldFine;
        this.onFieldWarning = onFieldWarning;
        this.onFieldDanger = onFieldDanger;
        this.onFieldExpended = onFieldExpended;
        // Register callbacks

        this.bindElement();
        // Bind the class to the element
    }

    /**
     * Generate the markup to be placed under the element, allow templating?
     * @return {void}
     */
    createElementCounter() {

        let counterMarkup = `<small class="${this.counterClass} ${this.activeState.colourClass}">${this.remainingCharacters}</small>`;
        // Generate counter markup
        // TODO: Allow this to be templated?

        this.element.insertAdjacentHTML('afterend', counterMarkup);
        // Insert the counter after the element in question

        return this.element.nextElementSibling;
    }

    /**
     * Update character count for the elements counter
     * @return {void}
     */
    updateElementCounter() {

        this.counter.textContent = this.remainingCharacters;
        // Update remaining characters

        this.counter.className = `${this.counterClass} ${this.activeState.colourClass}`;
        // Set active class
    }

    /**
     * Bind the required events onto the element / determine initial state
     * @return {void}
     */
    bindElement() {

        this.element.addEventListener('input', this.handleInputEvent.bind(this));
        // Register the event listener to the DOM elements required

        this.updateElementState();
        // Calculate initial counts for each element
    }

    /**
     * Initial handler of the event
     * @return {void}
     */
    handleInputEvent() {

        this.updateElementState();
        // Update properties, trigger new states and fire events
    }

    /**
     * Updates the internal properties to the latest determined state
     * @return {void}
     */
    updateElementState() {

        this.inputLength = this.element.value.length;
        // Update element input length

        this.remainingCharacters = (this.states.fine.threshold - this.inputLength);
        // Perform count on the element against the limit

        this.determineElementState();
        // Get the active state determined by the result of the calculation

        this.updateElementCounter();
        // Update the existing DOM element counter
    }

    /**
     * Determine the element state, with the intention to fire events/manage active state
     * @return {void}
     */
    determineElementState() {

        if (this.inputLength === 0) {

            if (!this.states.empty.isActive()) {

                this.onFieldEmpty(this.element, this.remainingCharacters);

                this.states.empty.isActive(true);

                this.activeState = this.states.empty;
            }
            // Fire callback, set active state

            return;
        }
        // Empty state trigger

        if (this.remainingCharacters <= this.states.expended.threshold) {

            if (!this.states.expended.isActive()) {

                this.onFieldExpended(this.element, this.remainingCharacters);

                this.states.expended.isActive(true);

                this.activeState = this.states.expended;
            }
            // Fire callback, set active state

            return;
        }
        // Limit state trigger

        if (this.remainingCharacters <= this.states.danger.threshold) {

            if (!this.states.danger.isActive()) {

                this.onFieldDanger(this.element, this.remainingCharacters);

                this.states.danger.isActive(true);

                this.activeState = this.states.danger;
            }
            // Fire callback, set active state

            return;
        }
        // Danger state trigger

        if (this.remainingCharacters <= this.states.warning.threshold) {

            if (!this.states.warning.isActive()) {

                this.onFieldWarning(this.element, this.remainingCharacters);

                this.states.warning.isActive(true);

                this.activeState = this.states.warning;
            }
            // Fire callback, set active state

            return;
        }
        // Warning state trigger

        if (this.remainingCharacters <= this.states.fine.threshold) {

            if (!this.states.fine.isActive()) {

                this.onFieldFine(this.element, this.remainingCharacters);

                this.states.fine.isActive(true);

                this.activeState = this.states.fine;
            }
            // Fire callback, set active state

            return;
        }
        // Fine state trigger
    }
}
