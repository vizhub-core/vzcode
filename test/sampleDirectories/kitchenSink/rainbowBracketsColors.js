function showcaseCurlyBracketNesting1() {
    function level1() {
        function level2() {
            function level3() {
                function level4() {
                    function level5() {
                        function level6() {
                            function level7() {
                                function level8() {
                                }
                            }
                        }
                    }
                }
            }
        }
    }
}
const showcaseCurlyBracketNesting2 = 
{level1: {level2: {level3: {level4: {level5: {level6: {level7: {level8: {}}}}}}}}};

const showcaseSquareBracketNesting1 = 
[  
    [
        [
            [
                [
                    [
                        [
                            [
                                [
                                ]
                            ]
                        ]
                    ]
                ]
            ]
        ]
    ]
];
const showcaseSquareBracketNesting2 =
[level1, [level2, [level3, [level4, [level5, [level6, [level7, [level8, []]]]]]]]];

const showcaseParenthesis1 = (
    (
        (
            (
                (
                    (
                        (
                            (
                                (
                                    'Nested'
                                )
                            )
                        )
                    )
                )
            )
        )
    )
);
const showcaseParenthesis2 = 
(   (   (   (   (   (   (   ('Nested')  )   )   )   )   )   )   );

const showcaseMixedNesting1 = {
    level1: [
        {
            level2: (
                [
                    {
                        level3: {
                            level4: [
                                {
                                    level5: {
                                        level6: {
                                            level7: [
                                                {
                                                    level8: {}
                                                }
                                            ]
                                        }
                                    }
                                }
                            ]
                        }
                    }
                ]
            )
        }
    ]
};
const showcaseMixedNesting2 = 
{level1: [level2, [level3, {level4: [level5, {level6: {level7: [level8, []]}}]}]]};


