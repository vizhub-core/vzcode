https://imgur.com/a/YkrGdLT

Features:
HCL Color Picker
Hue
Chroma
Luminance
Allows user to choose color based on Hue, Chroma, and Luminance sliders while some people may not prefer this me and Curran really like this sort of thing as we both are really into visualization and this can be really helpful.
Still allows to go back to default color picker using switch button
Colortext that updates hex value as user chooses new colors also updates the color of this text to its hex value (we use this value for set text)
Moving any of the sliders h,c,l will change vals and therefore hex color
Took advantage of d3 to simplify process of using h,c,l for hex value
Takes advantage of Tailwind CSS something slightly new for me but I have been learning about it quite a bit as I plan to go into frontend dev

Known Bugs:
Set text is not working as intended I have managed to fix the issue sort of however im assuming since I cant fix it fully its a larger issue with code-mirror (interact).
Not a bug but sliders particularly chroma and luminance need to have their gradients fixed. However what I have added for now still constitues an HCL color picker it could just be a little bit better.
No other known bugs/issues.

Future Works:
Mentioned some of these in the code comments
Graphical option for color picker
Fix settext bug
Improve VZCode in context of working with visualizations (HCL color picker was a big thing)
Improve slider gradients particularly for C and L
Addition of alpha slider (for opacity I had issues trying to include this)
Animations for sliders/thumb

Read more about documentation within code files + will add tutorial for hcl color picking eventually
