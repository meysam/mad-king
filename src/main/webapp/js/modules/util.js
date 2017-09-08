/**
 * Created by meysam on 8/6/17.
 */
export function addClass(el, className) {
    el.className += ' ' + className;
};

export function removeClass(el, className){
    var elClass = ' ' + el.className + ' ';
    while (elClass.indexOf(' ' + className + ' ') !== -1) {
        elClass = elClass.replace(' ' + className + ' ', '');
    }
    el.className = elClass;
};