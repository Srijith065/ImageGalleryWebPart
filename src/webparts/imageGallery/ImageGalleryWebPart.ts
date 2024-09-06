import { Version } from '@microsoft/sp-core-library';
import { IPropertyPaneConfiguration, PropertyPaneTextField } from '@microsoft/sp-property-pane';
import { BaseClientSideWebPart } from '@microsoft/sp-webpart-base';
import { escape } from '@microsoft/sp-lodash-subset';
import axios from 'axios';
import * as strings from 'ImageGalleryWebPartStrings';
import styles from './ImageGalleryWebPart.module.scss'; // Ensure this path is correct

export interface IImageGalleryWebPartProps {
  description: string;
}

export default class ImageGalleryWebPart extends BaseClientSideWebPart<IImageGalleryWebPartProps> {

  public render(): void {
    this.domElement.innerHTML = `
      <section class="${styles.imageGallery}">
        <div class="${styles.filters}">
          <input type="text" id="searchQuery" placeholder="Search images..." />
          <select id="orientationFilter">
            
            <option value="landscape">Landscape</option>
            <option value="portrait">Portrait</option>
            <option value="squarish">Squarish</option>
          </select>
          <button id="searchButton">Search</button>
        </div>
        <div id="imageGrid" class="${styles.grid}"></div>
      </section>
    `;

    this._bindEvents();
  }

  private _bindEvents(): void {
    const searchButton = this.domElement.querySelector('#searchButton') as HTMLButtonElement;
    searchButton.addEventListener('click', () => this._fetchImages());

    const searchQuery = this.domElement.querySelector('#searchQuery') as HTMLInputElement;
    searchQuery.addEventListener('keypress', (event) => {
      if (event.key === 'Enter') {
        this._fetchImages();
      }
    });
  }

  private _fetchImages(): void {
    const searchQuery = (this.domElement.querySelector('#searchQuery') as HTMLInputElement).value;
    const orientation = (this.domElement.querySelector('#orientationFilter') as HTMLSelectElement).value;

    const UNSPLASH_ACCESS_KEY = 'eEE957Ug2hT3rLdjRzSQ8IQEIB6PK1IpzIQuWlD7Ti8'; // Replace with your Unsplash Access Key

    axios.get('https://api.unsplash.com/search/photos', {
      params: {
        query: searchQuery || 'nature', // Default search query if empty
        client_id: UNSPLASH_ACCESS_KEY,
        orientation: orientation,
        per_page: 12, // Number of images per page
      },
    })
      .then(response => this._renderImages(response.data.results))
      .catch(error => console.error('Error fetching images:', error));
  }

  private _renderImages(images: any[]): void {
    const imageGrid = this.domElement.querySelector('#imageGrid') as HTMLElement;
    imageGrid.innerHTML = ''; // Clear existing images

    images.forEach(image => {
      const imageCard = document.createElement('div');
      imageCard.className = styles.card; // Ensure this class is defined in your SCSS
      imageCard.innerHTML = `
        <img src="${image.urls.small}" alt="${escape(image.alt_description)}" class="${styles.image}" />
        <p>${escape(image.alt_description || 'No description available')}</p>
      `;
      imageGrid.appendChild(imageCard);
    });
  }

  protected onInit(): Promise<void> {
    return Promise.resolve();
  }

  protected onThemeChanged(currentTheme: any): void { // Adjusted type
    if (!currentTheme) {
      return;
    }

    const { semanticColors } = currentTheme;

    if (semanticColors) {
      this.domElement.style.setProperty('--bodyText', semanticColors.bodyText || null);
      this.domElement.style.setProperty('--link', semanticColors.link || null);
      this.domElement.style.setProperty('--linkHovered', semanticColors.linkHovered || null);
    }
  }

  protected get dataVersion(): Version {
    return Version.parse('1.0');
  }

  protected getPropertyPaneConfiguration(): IPropertyPaneConfiguration {
    return {
      pages: [
        {
          header: {
            description: strings.PropertyPaneDescription
          },
          groups: [
            {
              groupName: strings.BasicGroupName,
              groupFields: [
                PropertyPaneTextField('description', {
                  label: strings.DescriptionFieldLabel
                })
              ]
            }
          ]
        }
      ]
    };
  }
}
