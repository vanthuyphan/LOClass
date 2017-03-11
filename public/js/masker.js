/**
 * https://github.com/BankFacil/vanilla-masker
 */

inputs = document.getElementsByTagName('input');
for (var index = 0; index < inputs.length; ++index) {
    var input = inputs[index];
    if (input.hasAttribute('data-format')) {
        var format = input.getAttribute('data-format');
        var masker = {};
        switch (format) {
            case 'whole-money':
                masker = {
                    precision: 0,
                    delimiter: ',',
                    unit: '$',
                    zeroCents: false
                }
                break;
            case 'penny':
                masker = {
                    delimiter: ',',
                    unit: '$',
                    zeroCents: true
                }
                break;
        }
        VMasker(input).maskMoney(masker);
    }
}
