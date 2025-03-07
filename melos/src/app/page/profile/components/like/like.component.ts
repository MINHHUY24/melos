import {Component, OnInit} from '@angular/core';
import {Observable, Subscription} from 'rxjs';
import {AuthModel} from '../../../../models/auth.model';
import {SongModel} from '../../../../models/song.model';
import {Store} from '@ngrx/store';
import {AuthState} from '../../../../ngrx/auth/auth.state';
import {SongState} from '../../../../ngrx/song/song.state';
import {AsyncPipe, NgIf} from '@angular/common';
import {LoadingComponent} from '../../../../shared/components/loading/loading.component';
import {MusicTabComponent} from '../../../../shared/components/music-tab/music-tab.component';
import * as SongActions from '../../../../ngrx/song/song.actions';
import {ActivatedRoute} from '@angular/router';


@Component({
  selector: 'app-like',
  standalone: true,
  imports: [
    AsyncPipe,
    LoadingComponent,
    MusicTabComponent,
    NgIf
  ],
  templateUrl: './like.component.html',
  styleUrl: './like.component.scss'
})
export class LikeComponent implements OnInit {
  auth$!: Observable<AuthModel | null>;
  songListLiked$!: Observable<SongModel[]>;
  subscription: Subscription[] = [];
  authData: AuthModel | null = null;
  songListLiked: SongModel[] = [];
  isLoading$!: Observable<boolean>;
orderAuth: any;


  constructor(
    private activateRoute: ActivatedRoute,

    private store: Store<{

                 auth: AuthState;
                 song: SongState;

               }>,
  ) {
    this.auth$ = this.store.select('auth', 'authData');
    this.songListLiked$ = this.store.select('song', 'songListLiked');
    this.isLoading$ = this.store.select('song', 'isLoading');

  }


  ngOnInit() {
    this.subscription.push(


      this.activateRoute.params.subscribe(params => {
        console.log('params-------------------', params['id']);
        const id = params['id'];
        if (id){
          this.orderAuth = id;
          console.log('orderAuth-------------------', this.orderAuth);
          this.store.dispatch(
            SongActions.getSongLiked({
              uid: this.orderAuth,
              idToken: this.orderAuth.idToken ?? '1',
            }),
          );
        }
      }),



      this.songListLiked$.subscribe((songListLiked) => {
        console.log('songListLiked', songListLiked);
        if (songListLiked.length > 0) {
          this.songListLiked = songListLiked;
          console.log('[Like Component] Updated likeSongList:', this.songListLiked);
        }
      }),
    );

    if (this.authData) {
    }
  }

  ngOnDestroy() {
    this.subscription.forEach((sub) => sub.unsubscribe());
  }

}
