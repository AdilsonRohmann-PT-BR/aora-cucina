# Imagens do projeto

## Situação atual
O site funciona com **ilustrações vetoriais originais** (`illustrations/*.svg`), criadas para este projeto.
Elas aparecem com o selo "Ilustração conceitual" e não representam o restaurante.

## Como usar fotografias reais (opcional)
1. Coloque os JPG em `assets/images/photos/` com EXATAMENTE estes nomes.
2. Em `js/script.js`, mude `usePhotos: false` para `usePhotos: true`.
3. O script troca cada ilustração pela foto correspondente e muda o selo para "Foto ilustrativa".
   Se a foto for do próprio restaurante, e autorizada, edite o texto do selo no `index.html`
   (ou remova o `<span class="photo__badge">`).
4. Ajuste o `data-photo-alt` de cada imagem no `index.html` para descrever a foto real.

| Arquivo (em assets/images/photos/) | Proporção / tamanho    | Onde aparece                      |
|-------------------------------------|------------------------|-----------------------------------|
| hero.jpg                            | 16:9, até 1600x900     | Topo do site                      |
| massa.jpg                           | 4:5, até 900x1125      | Seção de culinária (grande)       |
| risoto.jpg                          | 1:1, até 1000x1000     | Seção de culinária (pequena)      |
| ambiente-01.jpg                     | 3:4, até 900x1200      | Galeria (destaque vertical)       |
| ambiente-02.jpg                     | 4:3, até 1200x900      | Galeria                           |
| ambiente-03.jpg                     | 4:3, até 1200x900      | Galeria                           |
| ambiente-04.jpg                     | 16:9, até 1600x900     | Galeria (larga)                   |
| ambiente-05.jpg                     | 4:3, até 1200x900      | Galeria (larga)                   |
| ambiente-06.jpg                     | 4:3, até 1200x900      | Galeria                           |

Otimização: use JPG ou WebP com qualidade 75–82 e mantenha cada arquivo abaixo de ~250 KB.
O CSS usa `object-fit: cover`, então outras proporções funcionam, mas podem ser cortadas.
Este projeto usa um arquivo por foto: as versões em vários tamanhos (srcset) não estão implementadas.

## Origem das fotos
- Fotos do próprio restaurante: peça autorização por escrito (Instagram @aoracucina ou aoracucina@gmail.com).
- Bancos gratuitos (Pexels, Unsplash): confira a licença em pexels.com/license e unsplash.com/license.
  Não sugira que as pessoas ou o local retratados sejam o restaurante. Identifique como ilustrativas.
- Candidatas no Pexels (apenas as descrições foram lidas, as imagens NÃO foram verificadas):
  6287456, 4699928, 4377178, 30507460 → https://www.pexels.com/photo/ID/