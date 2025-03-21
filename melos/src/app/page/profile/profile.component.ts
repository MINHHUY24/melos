import {Component, OnDestroy, OnInit} from '@angular/core';
import { MatTab, MatTabGroup } from '@angular/material/tabs';
import {ActivatedRoute, Router, RouterOutlet} from '@angular/router';
import {Store} from '@ngrx/store';
import {AuthState} from '../../ngrx/auth/auth.state';
import {HistoryState} from '../../ngrx/history/history.state';
import * as HistoryActions from '../../../app/ngrx/history/history.actions';
import {Observable, Subscription} from 'rxjs';
import {AuthModel} from '../../models/auth.model';
import {SongModel} from '../../models/song.model';
import {DialogLoginComponent} from '../../shared/components/dialog-login/dialog-login.component';
import {AsyncPipe, NgIf} from '@angular/common';
import {LoadingComponent} from '../../shared/components/loading/loading.component';
import {HistoryComponent} from './components/history/history.component';
import {UploadComponent} from '../upload/upload.component';
import {LikeComponent} from './components/like/like.component';
import {UploadedComponent} from './components/uploaded/uploaded.component';
import {IdToAvatarPipe} from '../../shared/pipes/id-to-avatar.pipe';
import {IdToNamePipe} from '../../shared/pipes/id-to-name.pipe';
import * as AuthActions from '../../ngrx/auth/auth.actions';
import * as SongActions from '../../ngrx/song/song.actions';
import * as LikeActions from '../../ngrx/like/like.actions';
import * as UploadedActions from '../../ngrx/uploaded/uploaded.actions';


@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [MatTab, MatTabGroup, DialogLoginComponent, AsyncPipe,  HistoryComponent, LikeComponent, UploadedComponent, IdToAvatarPipe, IdToNamePipe],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.scss',
})
export class ProfileComponent implements OnInit, OnDestroy {
  auth$!: Observable<AuthModel | null>;
  historySongList$!: Observable<SongModel[]>;
  subscription: Subscription[] = [];
  authData: AuthModel | null = null;
  historySongList: SongModel[] = [];
  orderAuth: any

  constructor(
    private activateRoute: ActivatedRoute,
    private store: Store<{
      auth: AuthState;
      history: HistoryState;
    }>,

    private router: Router,
  ) {

    this.auth$ = this.store.select('auth', 'authData');
    this.historySongList$ = this.store.select('history', 'historySongList');

  }

  ngOnInit() {
    this.subscription.push(

      this.activateRoute.params.subscribe(params => {
        console.log('params-------------------', params['id']);
        const id = params['id'];
        if (id){
          this.orderAuth = id.toString();
          console.log(this.orderAuth);
        }
      }),

      this.auth$.subscribe((auth) => {
        if (auth?.uid) {
          this.authData = auth;
          console.log('authData History', this.authData);

          if((this.authData.uid != this.orderAuth) && this.authData.idToken) {
            this.store.dispatch(UploadedActions.getUploadSongList({
              uid: this.orderAuth,
              idToken: this.authData.idToken ,
            }))
            this.store.dispatch(HistoryActions.getHistorySongList({
              idToken: this.authData.idToken ,
              uid: this.orderAuth.uid ,
            }));
          }else if((this.orderAuth === this.authData.uid) && this.authData.idToken && this.authData.uid) {
            this.store.dispatch(HistoryActions.getHistorySongList({
              idToken: this.authData.idToken ,
              uid: this.authData.uid ,
            }));

            this.store.dispatch(UploadedActions.getUploadSongList({
              uid: this.authData.uid,
              idToken: this.authData.idToken ,
            }))
            this.store.dispatch(LikeActions.getSongIdLiked({
              idToken: this.authData.idToken,
              uid: this.authData.uid,
            }));
          }
        }
      }),



    );
  }

  ngOnDestroy() {
    this.subscription.forEach((sub) => sub.unsubscribe());
    this.store.dispatch(HistoryActions.clearState());
    this.store.dispatch(SongActions.clearStateSongLiked());
    this.store.dispatch(UploadedActions.clearState());
    this.store.dispatch(LikeActions.clearStateSongIdLikes());


  }
  onImageError(event: Event) {
    const imgElement = event.target as HTMLImageElement;
    imgElement.src =
      'https://img.freepik.com/free-psd/3d-illustration-person-with-sunglasses_23-2149436188.jpg';
  }
}

