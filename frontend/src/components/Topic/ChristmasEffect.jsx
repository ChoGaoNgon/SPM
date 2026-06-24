import { useEffect } from 'react';
import { useTheme } from '~/contexts/ThemeContext';
import './christmas.css';

const ChristmasEffect = ({ children }) => {
    const { isDarkMode } = useTheme();

    useEffect(() => {
        const snowColor = isDarkMode ? '#ffffff' : '#00aaff';
        const container = document.querySelector('.snow-container');
        if (container) {
            container.querySelectorAll('.snowflake').forEach((s) => {
                s.style.color = snowColor;
            });
        }
    }, [isDarkMode]);

    useEffect(() => {
        let container = document.querySelector('.snow-container');
        if (!container) {
            container = document.createElement('div');
            container.className = 'snow-container';
            document.body.appendChild(container);

            for (let i = 0; i < 50; i++) {
                const snow = document.createElement('div');
                snow.className = 'snowflake';
                snow.style.left = Math.random() * 100 + 'vw';
                snow.style.animationDuration = 3 + Math.random() * 5 + 's';
                snow.style.opacity = Math.random();
                snow.style.fontSize = 8 + Math.random() * 12 + 'px';
                snow.style.color = isDarkMode ? '#ffffff' : '#00aaff';
                container.appendChild(snow);
            }

            const slots = 20;
            for (let i = 0; i < slots; i++) {
                if (i % 2 === 0) {
                    const santa = document.createElement('img');
                    santa.src =
                        'https://vector6.com/wp-content/uploads/2022/02/png0000560-ong-gia-noel-xe-keo-tuan-loc-giang-sinh-file-png.png';
                    santa.className = 'christmas-santa-multiple';
                    santa.style.left = i * 5 + '%';
                    document.body.appendChild(santa);
                } else {
                    const tree = document.createElement('img');
                    tree.src =
                        'https://dulieudohoa.com/media/w750/2018/10/cay-thong-noel-750-min5bd9acc7d3404_14a85a5231060b3637a528daf1a8cb76.png';
                    tree.className = 'christmas-tree-multiple';
                    tree.style.left = i * 5 + '%';
                    document.body.appendChild(tree);
                }
            }
        }

        return () => {
            const cont = document.querySelector('.snow-container');
            const trees = document.querySelectorAll('.christmas-tree-multiple');
            const santas = document.querySelectorAll('.christmas-santa-multiple');

            if (cont) document.body.removeChild(cont);
            trees.forEach((tree) => document.body.removeChild(tree));
            santas.forEach((santa) => document.body.removeChild(santa));
        };
    }, []);

    return <>{children}</>;
};

export default ChristmasEffect;
